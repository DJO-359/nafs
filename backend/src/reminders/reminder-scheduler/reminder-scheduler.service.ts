import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Reminder } from '../models/reminder.model';
import { User } from '../../users/models/user.model';
import { UsersService } from '../../users/users.service';
import { TelegramService } from '../../telegram/telegram.service';
import { nextOccurrenceAfter } from '../repeat.util';
import { safeTimeZone } from '../../common/utils/timezone.util';

/** Сколько напоминаний обрабатываем за тик, чтобы не выгребать всю таблицу. */
const BATCH_SIZE = 500;

/** Пауза перед повтором после технической ошибки отправки. */
const RETRY_DELAY_MINUTES = 5;

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @InjectModel(Reminder)
    private readonly reminderModel: typeof Reminder,
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReminders(): Promise<void> {
    if (!this.telegramService.isEnabled()) {
      return;
    }

    // Ошибка в одном напоминании не должна ронять весь тик:
    // раньше первый же сбой БД молча пропускал остальную пачку
    try {
      const now = new Date();
      const due = await this.findDue(now);

      if (!due.length) {
        return;
      }

      this.logger.log(`К отправке: ${due.length}`);

      for (const reminder of due) {
        try {
          await this.processReminder(reminder, now);
        } catch (error) {
          console.dir(error, { depth: null });
          const isSequelizeError =
            error &&
            typeof error === 'object' &&
            'parent' in error &&
            'original' in error &&
            'sql' in error;
          if (isSequelizeError) {
            console.error('Sequelize error details:', {
              message: (error as any).message,
              parent: (error as any).parent,
              original: (error as any).original,
              sql: (error as any).sql,
              parameters: (error as any).parameters,
            });
          }
          this.logger.error(
            `Ошибка обработки напоминания ${reminder.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } catch (error) {
      console.dir(error, { depth: null });
      const isSequelizeError =
        error &&
        typeof error === 'object' &&
        'parent' in error &&
        'original' in error &&
        'sql' in error;
      if (isSequelizeError) {
        console.error('Sequelize error details:', {
          message: (error as any).message,
          parent: (error as any).parent,
          original: (error as any).original,
          sql: (error as any).sql,
          parameters: (error as any).parameters,
        });
      }
      this.logger.error(
        'Ошибка тика планировщика',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private findDue(now: Date): Promise<Reminder[]> {
    return this.reminderModel.findAll({
      where: {
        [Op.or]: [
          // Отложенные кнопкой «через час» / «завтра»
          { snoozedUntil: { [Op.ne]: null, [Op.lte]: now } },
          // Обычное срабатывание по расписанию
          {
            snoozedUntil: null,
            completed: false,
            remindAt: { [Op.lte]: now },
          },
        ],
      },
      include: [
        {
          model: User,
          required: true,
          // Заблокировавшим бота не пишем — иначе вечный повтор каждую минуту
          where: { telegramBlockedAt: null },
        },
      ],
      order: [['remindAt', 'ASC']],
      limit: BATCH_SIZE,
    });
  }

  private async processReminder(reminder: Reminder, now: Date): Promise<void> {
    const user = reminder.user;
    const timezone = safeTimeZone(user?.timezone);

    // Срабатывание отложенного показа не должно двигать расписание повтора
    const wasSnoozed = reminder.snoozedUntil !== null;

    if (!user?.telegramId) {
      this.logger.warn(
        `У напоминания ${reminder.id} нет telegramId — двигаем расписание без отправки`,
      );
      await this.advance(reminder, now, timezone, wasSnoozed);
      return;
    }

    const result = await this.telegramService.sendMessage(
      user.telegramId,
      this.buildMessage(reminder),
      reminder.id,
    );

    switch (result.status) {
      case 'sent':
        reminder.lastTriggeredAt = now;
        await this.advance(reminder, now, timezone, wasSnoozed);
        return;

      case 'blocked':
        // Помечаем пользователя и всё равно двигаем расписание, чтобы после
        // разблокировки не прилетела пачка накопившихся напоминаний
        await this.usersService.markTelegramBlocked(user.id);
        await this.advance(reminder, now, timezone, wasSnoozed);
        return;

      case 'rate-limited':
        reminder.snoozedUntil = new Date(
          now.getTime() + result.retryAfterSeconds * 1000,
        );
        await reminder.save();
        return;

      case 'failed':
      default:
        // Технический сбой: пробуем позже, а не каждую минуту
        reminder.snoozedUntil = new Date(
          now.getTime() + RETRY_DELAY_MINUTES * 60 * 1000,
        );
        await reminder.save();
        return;
    }
  }

  /**
   * Двигает расписание вперёд.
   * Ключевой момент: следующее срабатывание считается относительно `now`, а не
   * старого remindAt. Иначе после простоя сервиса напоминание уходило бы
   * пользователю пачкой — по одному сообщению в минуту, пока расписание
   * не догонит текущий момент.
   */
  private async advance(
    reminder: Reminder,
    now: Date,
    timezone: string,
    wasSnoozed: boolean,
  ): Promise<void> {
    if (wasSnoozed) {
      reminder.snoozedUntil = null;
      await reminder.save();
      return;
    }

    const next = nextOccurrenceAfter(
      reminder.remindAt,
      now,
      {
        repeatType: reminder.repeatType,
        repeatInterval: reminder.repeatInterval,
        repeatDays: reminder.repeatDays,
      },
      timezone,
    );

    if (next) {
      reminder.remindAt = next;
      reminder.completed = false;
    } else {
      reminder.completed = true;
    }

    reminder.snoozedUntil = null;
    await reminder.save();
  }

  private buildMessage(reminder: Reminder): string {
    const description = reminder.description?.trim();

    return description
      ? `🔔 Напоминание\n\n${reminder.title}\n\n${description}`
      : `🔔 Напоминание\n\n${reminder.title}`;
  }
}

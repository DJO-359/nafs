import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Reminder } from '../models/reminder.model';
import { User } from '../../users/models/user.model';
import { TelegramService } from '../../telegram/telegram.service';
import { ReminderRepeatType } from '../enums/reminder-repeat-type.enum';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @InjectModel(Reminder)
    private readonly reminderModel: typeof Reminder,

    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReminders() {
    const reminders = await this.reminderModel.findAll({
      where: {
        completed: false,
        remindAt: {
          [Op.lte]: new Date(),
        },
      },
      include: [
        {
          model: User,
        },
      ],
    });

    if (!reminders.length) {
      this.logger.log('Нет просроченных напоминаний');
      return;
    }

    this.logger.log(`Найдено ${reminders.length} напоминаний`);

    for (const reminder of reminders) {
      this.logger.log(`🔔 ${reminder.title}`);

      // Проверяем, есть ли Telegram-идентификатор у пользователя
      if (!reminder.user?.telegramId) {
        this.logger.warn(
          `Пользователь для напоминания ${reminder.id} не имеет telegramId, пропускаем`,
        );
        continue; // пропускаем обработку этого напоминания
      }

      // Отправляем сообщение, получаем boolean результат
      const delivered = await this.telegramService.sendMessage(
        reminder.user.telegramId,
        `🔔 Напоминание\n\n${reminder.title}\n\n${reminder.description ?? ''}`,
        reminder.id,
      );

      // Если сообщение не доставлено – пропускаем обновление и переходим к следующему
      if (!delivered) {
        this.logger.error(
          `Не удалось доставить Telegram для напоминания ${reminder.id}`,
        );
        continue;
      }

      // Отмечаем время последнего срабатывания
      await reminder.update({
        lastTriggeredAt: new Date(),
      });

      // Определяем следующее действие в зависимости от типа повторения
      switch (reminder.repeatType) {
        case ReminderRepeatType.NONE:
          await reminder.update({
            completed: true,
          });
          break;

        case ReminderRepeatType.DAILY:
          await reminder.update({
            remindAt: this.addDays(reminder.remindAt, 1),
          });
          break;

        case ReminderRepeatType.INTERVAL:
          await reminder.update({
            remindAt: this.addDays(reminder.remindAt, reminder.repeatInterval),
          });
          break;

        case ReminderRepeatType.WEEKLY:
          await reminder.update({
            remindAt: this.getNextWeeklyDate(reminder),
          });
          break;

        case ReminderRepeatType.MONTHLY:
          await reminder.update({
            remindAt: this.addMonth(reminder.remindAt),
          });
          break;

        case ReminderRepeatType.CUSTOM:
          await reminder.update({
            remindAt: this.addDays(reminder.remindAt, reminder.repeatInterval),
          });
          break;
      }
    }
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonth(date: Date) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    return result;
  }

  private getNextWeeklyDate(reminder: Reminder) {
    const days = reminder.repeatDays ?? [];

    if (!days.length) {
      return this.addDays(reminder.remindAt, 7);
    }

    const current = reminder.remindAt.getDay();

    for (let i = 1; i <= 7; i++) {
      const next = (current + i) % 7;

      if (days.includes(next)) {
        return this.addDays(reminder.remindAt, i);
      }
    }

    return this.addDays(reminder.remindAt, 7);
  }
}

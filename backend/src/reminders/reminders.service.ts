import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Reminder } from './models/reminder.model';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderRepeatType } from './enums/reminder-repeat-type.enum';
import {
  addDaysInZone,
  dayRangeInZone,
  formatDayInZone,
  getZonedParts,
  todayInZone,
  zonedTimeToUtc,
} from '../common/utils/timezone.util';

/** Час, на который переносится напоминание кнопкой «Завтра». */
const TOMORROW_SNOOZE_HOUR = 9;

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder)
    private readonly reminderModel: typeof Reminder,
  ) {}

  create(userId: string, dto: CreateReminderDto) {
    return this.reminderModel.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      remindAt: new Date(dto.remindAt),
      repeatType: dto.repeatType ?? ReminderRepeatType.NONE,
      repeatInterval: dto.repeatInterval ?? 1,
      repeatDays: dto.repeatDays ?? null,
      completed: false,
      snoozedUntil: null,
      lastTriggeredAt: null,
    } as Partial<Reminder> as Reminder);
  }

  findAll(userId: string) {
    return this.reminderModel.findAll({
      where: { userId },
      order: [['remindAt', 'ASC']],
    });
  }

  /** Владелец проверяется всегда — иначе чужой id из URL сработал бы. */
  private async findOwned(userId: string, id: string): Promise<Reminder> {
    const reminder = await this.reminderModel.findOne({
      where: { id, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Напоминание не найдено');
    }

    return reminder;
  }

  async complete(userId: string, id: string) {
    const reminder = await this.findOwned(userId, id);

    reminder.completed = true;
    reminder.snoozedUntil = null;
    await reminder.save();

    return reminder;
  }

  async remove(userId: string, id: string) {
    const reminder = await this.findOwned(userId, id);

    await reminder.destroy();

    return { deleted: true };
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    const reminder = await this.findOwned(userId, id);

    if (dto.title !== undefined) reminder.title = dto.title;
    if (dto.description !== undefined) {
      reminder.description = dto.description ?? null;
    }
    if (dto.remindAt !== undefined) {
      reminder.remindAt = new Date(dto.remindAt);
      // Изменили время — старый перенос больше не актуален
      reminder.snoozedUntil = null;
      reminder.completed = false;
    }
    if (dto.repeatType !== undefined) reminder.repeatType = dto.repeatType;
    if (dto.repeatInterval !== undefined) {
      reminder.repeatInterval = dto.repeatInterval;
    }
    if (dto.repeatDays !== undefined) {
      reminder.repeatDays = dto.repeatDays ?? null;
    }

    await reminder.save();

    return reminder;
  }

  getByDate(userId: string, timezone: string, date: string) {
    const { start, end } = dayRangeInZone(date, timezone);

    return this.reminderModel.findAll({
      where: {
        userId,
        // Полуинтервал вместо <= 23:59:59.999, чтобы не терять последнюю мс
        remindAt: { [Op.gte]: start, [Op.lt]: end },
      },
      order: [['remindAt', 'ASC']],
    });
  }

  /**
   * Напоминания на сегодня, завтра и дальше — для экрана дня.
   * Границы суток считаются в зоне пользователя.
   */
  async getUpcomingReminders(userId: string, timezone: string) {
    const today = todayInZone(timezone);
    const todayRange = dayRangeInZone(today, timezone);
    const tomorrowRange = dayRangeInZone(
      formatDayInZone(addDaysInZone(todayRange.start, 1, timezone), timezone),
      timezone,
    );

    const reminders = await this.reminderModel.findAll({
      where: {
        userId,
        remindAt: { [Op.gte]: todayRange.start },
      },
      order: [['remindAt', 'ASC']],
    });

    const todayItems: Reminder[] = [];
    const tomorrowItems: Reminder[] = [];
    const groupedUpcoming = new Map<string, Reminder[]>();

    for (const reminder of reminders) {
      const at = new Date(reminder.remindAt).getTime();

      if (at < todayRange.end.getTime()) {
        todayItems.push(reminder);
      } else if (at < tomorrowRange.end.getTime()) {
        tomorrowItems.push(reminder);
      } else {
        const key = formatDayInZone(new Date(reminder.remindAt), timezone);
        const bucket = groupedUpcoming.get(key);

        if (bucket) {
          bucket.push(reminder);
        } else {
          groupedUpcoming.set(key, [reminder]);
        }
      }
    }

    return {
      today: todayItems,
      tomorrow: tomorrowItems,
      upcoming: [...groupedUpcoming.entries()].map(([date, items]) => ({
        date,
        items,
      })),
    };
  }

  /**
   * Перенос «через час» — считается от текущего момента, а не от remindAt.
   * К моменту нажатия кнопки планировщик уже сдвинул remindAt по расписанию,
   * поэтому раньше «через час» на ежедневном давало «завтра + 1 час».
   */
  async snoozeByHours(userId: string, id: string, hours: number) {
    const reminder = await this.findOwned(userId, id);

    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    reminder.snoozedUntil = target;
    await reminder.save();

    return reminder;
  }

  /** Перенос на завтра — на утро следующего дня в зоне пользователя. */
  async snoozeToTomorrow(userId: string, id: string, timezone: string) {
    const reminder = await this.findOwned(userId, id);

    const tomorrow = addDaysInZone(new Date(), 1, timezone);
    const parts = getZonedParts(tomorrow, timezone);

    reminder.snoozedUntil = zonedTimeToUtc(
      parts.year,
      parts.month,
      parts.day,
      TOMORROW_SNOOZE_HOUR,
      0,
      0,
      timezone,
    );

    await reminder.save();

    return reminder;
  }

  /** Напоминания за период — для календаря вместо выгрузки всей истории. */
  getBetween(userId: string, from: Date, to: Date) {
    return this.reminderModel.findAll({
      where: {
        userId,
        remindAt: { [Op.gte]: from, [Op.lt]: to },
      },
      order: [['remindAt', 'ASC']],
    });
  }

  async getStats(
    userId: string,
  ): Promise<{ total: number; completed: number }> {
    const [total, completed] = await Promise.all([
      this.reminderModel.count({ where: { userId } }),
      this.reminderModel.count({ where: { userId, completed: true } }),
    ]);

    return { total, completed };
  }

  /**
   * Даты, когда напоминание реально срабатывало.
   * Именно lastTriggeredAt, а не remindAt: у повторяющихся напоминаний
   * remindAt всегда в будущем, и раньше это обнуляло серию дней.
   */
  async getTriggeredDates(userId: string, timezone: string): Promise<string[]> {
    const rows = await this.reminderModel.findAll({
      where: { userId, lastTriggeredAt: { [Op.ne]: null } },
      attributes: ['lastTriggeredAt'],
      raw: true,
    });

    return rows
      .map((row) => row.lastTriggeredAt)
      .filter((value): value is Date => Boolean(value))
      .map((value) => formatDayInZone(new Date(value), timezone));
  }
}

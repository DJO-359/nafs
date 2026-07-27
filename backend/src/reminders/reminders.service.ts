import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Reminder } from './models/reminder.model';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderRepeatType } from './enums/reminder-repeat-type.enum';

@Injectable()
export class RemindersService {
  constructor(
    @InjectModel(Reminder)
    private readonly reminderModel: typeof Reminder,
  ) {}

  async create(userId: string, dto: CreateReminderDto) {
    return this.reminderModel.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      remindAt: new Date(dto.remindAt),
      repeatType: dto.repeatType ?? ReminderRepeatType.NONE,
      repeatInterval: dto.repeatInterval ?? 1,
      repeatDays: dto.repeatDays ?? null,
      completed: false,
    } as Reminder);
  }

  async findAll(userId: string) {
    return this.reminderModel.findAll({
      where: {
        userId,
      },
      order: [['remindAt', 'ASC']],
    });
  }

  async getTodayReminders(userId: string) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    return this.reminderModel.findAll({
      where: {
        userId,
        remindAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      order: [['remindAt', 'ASC']],
    });
  }

  async complete(id: string, userId: string) {
    const reminder = await this.reminderModel.findOne({
      where: { id, userId },
    });
    if (!reminder) {
      throw new NotFoundException('Напоминание не найдено');
    }
    reminder.completed = true;
    await reminder.save();
    return reminder;
  }

  async remove(userId: string, id: string) {
    const reminder = await this.reminderModel.findOne({
      where: { id, userId },
    });
    if (!reminder) return null;
    await reminder.destroy();
    return { deleted: true };
  }

  async update(userId: string, id: string, dto: CreateReminderDto) {
    const reminder = await this.reminderModel.findOne({
      where: { id, userId },
    });
    if (!reminder) return null;
    reminder.title = dto.title;
    reminder.description = dto.description ?? null;
    reminder.remindAt = new Date(dto.remindAt);
    await reminder.save();
    return reminder;
  }

  async getAll(userId: string) {
    return this.reminderModel.findAll({
      where: { userId },
    });
  }

  async getByDate(userId: string, date: string) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    return this.reminderModel.findAll({
      where: {
        userId,
        remindAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      order: [['remindAt', 'ASC']],
    });
  }

  // ----- обновлённый метод getUpcomingReminders с группировкой -----
  async getUpcomingReminders(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const reminders = await this.reminderModel.findAll({
      where: {
        userId,
        remindAt: {
          [Op.gte]: today,
        },
      },
      order: [['remindAt', 'ASC']],
    });

    // Группировка напоминаний, начиная с afterTomorrow, по датам
    const groupedUpcoming = new Map<string, Reminder[]>();

    for (const reminder of reminders) {
      const d = new Date(reminder.remindAt);
      if (d >= dayAfterTomorrow) {
        const key = d.toISOString().slice(0, 10);
        if (!groupedUpcoming.has(key)) {
          groupedUpcoming.set(key, []);
        }
        groupedUpcoming.get(key)!.push(reminder);
      }
    }

    return {
      today: reminders.filter((r) => {
        const d = new Date(r.remindAt);
        return d >= today && d < tomorrow;
      }),
      tomorrow: reminders.filter((r) => {
        const d = new Date(r.remindAt);
        return d >= tomorrow && d < dayAfterTomorrow;
      }),
      upcoming: Array.from(groupedUpcoming.entries()).map(([date, items]) => ({
        date,
        items,
      })),
    };
  }

  // ----- Новые методы для работы с отдельными напоминаниями (без userId) -----

  async completeById(id: string) {
    const reminder = await this.reminderModel.findByPk(id);
    if (!reminder) {
      return null;
    }
    reminder.completed = true;
    await reminder.save();
    return reminder;
  }

  async postponeHour(id: string) {
    const reminder = await this.reminderModel.findByPk(id);
    if (!reminder) {
      return null;
    }
    const remindAt = new Date(reminder.remindAt);
    remindAt.setHours(remindAt.getHours() + 1);
    reminder.remindAt = remindAt;
    reminder.completed = false;
    await reminder.save();
    return reminder;
  }

  async postponeTomorrow(id: string) {
    const reminder = await this.reminderModel.findByPk(id);
    if (!reminder) {
      return null;
    }
    const remindAt = new Date(reminder.remindAt);
    remindAt.setDate(remindAt.getDate() + 1);
    reminder.remindAt = remindAt;
    reminder.completed = false;
    await reminder.save();
    return reminder;
  }
}

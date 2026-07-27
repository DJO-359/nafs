import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Intention } from './models/intention.model';

@Injectable()
export class IntentionService {
  constructor(
    @InjectModel(Intention)
    private readonly intentionModel: typeof Intention,
  ) {}

  /**
   * Создать или обновить намерение на сегодня.
   */
  async setTodayIntention(userId: string, text: string) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.intentionModel.findOne({
      where: {
        userId,
        date: today,
      },
    });

    if (existing) {
      existing.text = text;
      existing.completed = false;

      await existing.save();

      return existing;
    }
    return this.intentionModel.create({
      userId,
      text,
      date: today,
      completed: false,
    } as any);
  }

  /**
   * Получить сегодняшнее намерение.
   */
  async getTodayIntention(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    return this.intentionModel.findOne({
      where: {
        userId,
        date: today,
      },
    });
  }

  /**
   * Отметить сегодняшнее намерение выполненным.
   */
  async completeTodayIntention(userId: string) {
    const intention = await this.getTodayIntention(userId);

    if (!intention) {
      return null;
    }

    intention.completed = true;

    await intention.save();

    return intention;
  }

  // ----- добавленный метод getAll -----
  async getAll(userId: string) {
    return this.intentionModel.findAll({
      where: {
        userId,
      },
    });
  }

  // ----- добавленный метод getByDate -----
  async getByDate(userId: string, date: string) {
    return this.intentionModel.findOne({
      where: {
        userId,
        date,
      },
    });
  }
}

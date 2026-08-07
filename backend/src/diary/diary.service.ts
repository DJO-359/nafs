import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { DiaryEntry } from './models/diary-entry.model';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class DiaryService {
  constructor(
    @InjectModel(DiaryEntry)
    private readonly diaryModel: typeof DiaryEntry,
  ) {}

  /**
   * Создает новую запись дневника.
   */
  async create(userId: string, timezone: string, content: string) {
    const today = todayInZone(timezone);

    return this.diaryModel.create({
      userId,
      content,
      date: today,
    });
  }

  /**
   * Все записи пользователя.
   */
  findAll(userId: string) {
    return this.diaryModel.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
  }

  /**
   * История дневника.
   */
  getHistory(userId: string) {
    return this.findAll(userId);
  }

  /**
   * Получить запись по ID.
   */
  async findOne(userId: string, id: string) {
    const entry = await this.diaryModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    return entry;
  }

  /**
   * Получить запись за конкретный день.
   */
  async getByDate(userId: string, date: string) {
    return this.diaryModel.findOne({
      where: {
        userId,
        date,
      },
    });
  }

  /**
   * Последняя запись пользователя.
   */
  async getLastEntry(userId: string) {
    return this.diaryModel.findOne({
      where: {
        userId,
      },
      order: [['date', 'DESC']],
    });
  }

  /**
   * Обновление записи.
   */
  async update(userId: string, id: string, content: string) {
    const entry = await this.findOne(userId, id);

    await entry.update({
      content,
    });

    return entry;
  }

  /**
   * Удаление записи.
   */
  async remove(userId: string, id: string) {
    const entry = await this.findOne(userId, id);

    await entry.destroy();
  }

  /**
   * Записи за период.
   */
  getBetween(userId: string, from: string, to: string) {
    return this.diaryModel.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: from,
          [Op.lte]: to,
        },
      },
      order: [['date', 'ASC']],
    });
  }

  /**
   * Количество записей.
   */
  count(userId: string): Promise<number> {
    return this.diaryModel.count({
      where: {
        userId,
      },
    });
  }

  /**
   * Даты активности пользователя.
   */
  async getActiveDates(userId: string, until: string): Promise<string[]> {
    const rows = await this.diaryModel.findAll({
      where: {
        userId,
        date: {
          [Op.lte]: until,
        },
      },
      attributes: ['date'],
      raw: true,
    });

    return (rows as { date: string }[]).map((row) => row.date);
  }
}

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
  async create(
    userId: string,
    timezone: string,
    content: string,
    color?: string,
  ) {
    const today = todayInZone(timezone);

    return this.diaryModel.create({
      userId,
      content,
      date: today,
      ...(color ? { color } : {}),
    } as DiaryEntry);
  }

  /**
   * Все записи пользователя.
   */
  findAll(userId: string) {
    return this.diaryModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
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
   * Получить записи за конкретную дату.
   */
  async getByDate(userId: string, date: string) {
    return this.diaryModel.findAll({
      where: {
        userId,
        date,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Последняя запись пользователя.
   */
  async getLastEntry(userId: string) {
    const [entry] = await this.diaryModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
      limit: 1,
    });

    return entry ?? null;
  }

  /**
   * Обновить запись.
   */
  async update(userId: string, id: string, content: string, color?: string) {
    const entry = await this.findOne(userId, id);

    await entry.update({
      content,
      ...(color ? { color } : {}),
    });

    return entry;
  }

  /**
   * Удалить запись.
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
   * Количество записей пользователя.
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

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
   * Создаёт запись за сегодняшний день.
   * День определяется колонкой date в часовом поясе пользователя.
   */
  async create(userId: string, timezone: string, content: string) {
    const today = todayInZone(timezone);

    return this.diaryModel.create({
      userId,
      content,
      date: today,
    } as Partial<DiaryEntry>);
  }

  findAll(userId: string) {
    return this.diaryModel.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
  }

  /**
   * Возвращает запись только владельца.
   */
  async findOne(userId: string, id: string) {
    const entry = await this.diaryModel.findOne({
      where: { id, userId },
    });

    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    return entry;
  }

  /**
   * Обновляет существующую запись.
   */
  async update(userId: string, id: string, content: string) {
    const entry = await this.findOne(userId, id);

    await entry.update({
      content,
    });

    return entry;
  }

  /**
   * Удаляет запись.
   */
  async remove(userId: string, id: string) {
    const entry = await this.findOne(userId, id);

    await entry.destroy();
  }

  getHistory(userId: string) {
    return this.findAll(userId);
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

  count(userId: string): Promise<number> {
    return this.diaryModel.count({
      where: { userId },
    });
  }

  /**
   * Даты активности до указанного дня включительно.
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

    return rows.map((row: { date: string }) => row.date);
  }
}

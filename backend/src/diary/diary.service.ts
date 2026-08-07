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
   * Создаёт или обновляет запись за сегодня.
   * День определяется колонкой date в зоне пользователя, а не createdAt.
   */
  async create(userId: string, timezone: string, content: string) {
    const today = todayInZone(timezone);
    return this.diaryModel.create({
      userId,
      content,
      date: today,
    } as Partial<DiaryEntry> as DiaryEntry);
  }

  findAll(userId: string) {
    return this.diaryModel.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
  }

  /**
   * Работа с одной записью всегда фильтруется по владельцу.
   * Раньше findOne/update/remove ходили по findByPk без userId — первый же
   * DELETE-эндпоинт по их образцу позволил бы удалить чужую запись.
   */
  async findOne(userId: string, id: string) {
    const entry = await this.diaryModel.findOne({ where: { id, userId } });

    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    return entry;
  }

  async update(userId: string, id: string, content: string) {
    const entry = await this.findOne(userId, id);
    return this.diaryModel.create({
      userId,
      content,
      date: today,
    } as Partial<DiaryEntry> as DiaryEntry);
      order: [['createdAt', 'DESC']],
    });
  }

  getHistory(userId: string) {
    return this.findAll(userId);
  }

  /** Записи за период — для календаря вместо выгрузки всей истории. */
  getBetween(userId: string, from: string, to: string) {
    return this.diaryModel.findAll({
      where: {
        userId,
        date: { [Op.gte]: from, [Op.lte]: to },
      },
      order: [['date', 'ASC']],
    });
  }

  count(userId: string): Promise<number> {
    return this.diaryModel.count({ where: { userId } });
  }

  /** Даты активности до указанного дня включительно — для расчёта серии. */
  async getActiveDates(userId: string, until: string): Promise<string[]> {
    const rows = await this.diaryModel.findAll({
      where: { userId, date: { [Op.lte]: until } },
      attributes: ['date'],
      raw: true,
    });

    return rows.map((row) => row.date);
  }
}

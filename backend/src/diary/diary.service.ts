import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { DiaryEntry } from './models/diary-entry.model';

@Injectable()
export class DiaryService {
  constructor(
    @InjectModel(DiaryEntry)
    private readonly diaryModel: typeof DiaryEntry,
  ) {}

  async create(userId: string, content: string) {
    // Проверяем, есть ли запись за сегодня
    const todayEntry = await this.getTodayEntry(userId);

    if (todayEntry) {
      // Обновляем существующую запись
      todayEntry.content = content;
      await todayEntry.save();
      return todayEntry;
    }

    // Создаём новую запись
    return this.diaryModel.create({
      userId,
      content,
    } as DiaryEntry);
  }

  async findAll(userId: string) {
    return this.diaryModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string) {
    return this.diaryModel.findByPk(id);
  }

  async update(id: string, content: string) {
    const entry = await this.diaryModel.findByPk(id);

    if (!entry) {
      return null;
    }

    entry.content = content;
    await entry.save();

    return entry;
  }

  async remove(id: string) {
    const entry = await this.diaryModel.findByPk(id);

    if (!entry) {
      return null;
    }

    await entry.destroy();

    return {
      deleted: true,
    };
  }

  async getLastEntry(userId: string) {
    return this.diaryModel.findOne({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Получить запись дневника за сегодняшний день.
   * Использует createdAt для определения дня.
   */
  async getTodayEntry(userId: string) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    return this.diaryModel.findOne({
      where: {
        userId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Получить историю всех записей дневника пользователя,
   * отсортированных по дате создания (от новых к старым).
   */
  async getHistory(userId: string) {
    return this.diaryModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  // ----- добавленный метод getAll -----
  async getAll(userId: string) {
    return this.diaryModel.findAll({
      where: {
        userId,
      },
    });
  }

  // ----- добавленный метод getByDate -----
  async getByDate(userId: string, date: string) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    return this.diaryModel.findOne({
      where: {
        userId,
        createdAt: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      order: [['createdAt', 'DESC']],
    });
  }
}

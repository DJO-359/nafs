import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { DiaryEntry } from './models/diary-entry.model';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class DiaryService {
  private readonly logger = new Logger(DiaryService.name);

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
    this.logger.log('[DiaryService.getByDate] before Sequelize findAll');

    return this.diaryModel
      .findAll({
        where: {
          userId,
          date,
        },
        order: [['createdAt', 'DESC']],
      })
      .then((result) => {
        this.logger.log('[DiaryService.getByDate] Sequelize findAll succeeded');
        return result;
      })
      .catch((error) => {
        this.logger.error(
          '[DiaryService.getByDate] Sequelize findAll failed',
          this.formatError(error),
        );
        throw error;
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
  async update(
    userId: string,
    id: string,
    data: {
      content: string;
      color?: string;
      isPinned?: boolean;
      pinEmoji?: string | null;
    },
  ) {
    const entry = await this.findOne(userId, id);

    if (data.isPinned === true) {
      await this.unpinOtherEntriesForDate(userId, entry.date, entry.id);
    }

    await entry.update({
      content: data.content,
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      ...(data.pinEmoji !== undefined ? { pinEmoji: data.pinEmoji } : {}),
    });

    return entry;
  }

  private async unpinOtherEntriesForDate(
    userId: string,
    date: string,
    currentEntryId: string,
  ) {
    const siblings = await this.diaryModel.findAll({
      where: {
        userId,
        date,
        isPinned: true,
        id: {
          [Op.ne]: currentEntryId,
        },
      },
    });

    await Promise.all(
      siblings.map((sibling) =>
        sibling.update({
          isPinned: false,
          pinEmoji: null,
        }),
      ),
    );
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
    this.logger.log('[DiaryService.getActiveDates] before Sequelize findAll');

    try {
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

      this.logger.log(
        '[DiaryService.getActiveDates] Sequelize findAll succeeded',
      );
      return (rows as { date: string }[]).map((row) => row.date);
    } catch (error) {
      this.logger.error(
        '[DiaryService.getActiveDates] Sequelize findAll failed',
        this.formatError(error),
      );
      throw error;
    }
  }

  private formatError(error: unknown): string {
    const candidate = error as {
      message?: string;
      name?: string;
      original?: { message?: string; code?: string };
      parent?: { message?: string; code?: string };
    };

    return JSON.stringify({
      message: candidate?.message,
      name: candidate?.name,
      originalMessage: candidate?.original?.message,
      parentMessage: candidate?.parent?.message,
      originalCode: candidate?.original?.code,
      parentCode: candidate?.parent?.code,
    });
  }
}

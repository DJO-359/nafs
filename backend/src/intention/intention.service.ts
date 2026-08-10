import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';

import { Intention } from './models/intention.model';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class IntentionService {
  private readonly logger = new Logger(IntentionService.name);

  constructor(
    @InjectModel(Intention)
    private readonly intentionModel: typeof Intention,
  ) {}

  /**
   * Создаёт или обновляет намерение на сегодня.
   *
   * Раньше здесь был find-then-create без уникального индекса: двойной тап
   * или ретрай создавали две строки на одну дату, после чего findOne
   * возвращал произвольную из них. Теперь на (userId, date) есть уникальный
   * индекс, а гонка ловится через UniqueConstraintError.
   */
  async setTodayIntention(userId: string, timezone: string, text: string) {
    const today = todayInZone(timezone);

    const existing = await this.intentionModel.findOne({
      where: { userId, date: today },
    });

    if (existing) {
      existing.text = text;
      existing.completed = false;
      await existing.save();
      return existing;
    }

    try {
      return await this.intentionModel.create({
        userId,
        text,
        date: today,
        completed: false,
      } as Partial<Intention> as Intention);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        // Параллельный запрос успел создать намерение — обновляем его
        const concurrent = await this.intentionModel.findOne({
          where: { userId, date: today },
        });

        if (concurrent) {
          concurrent.text = text;
          concurrent.completed = false;
          await concurrent.save();
          return concurrent;
        }
      }

      throw error;
    }
  }

  getTodayIntention(userId: string, timezone: string) {
    return this.getByDate(userId, todayInZone(timezone));
  }

  async completeTodayIntention(userId: string, timezone: string) {
    const intention = await this.getTodayIntention(userId, timezone);

    if (!intention) {
      return null;
    }

    intention.completed = true;
    await intention.save();

    return intention;
  }

  getByDate(userId: string, date: string) {
    this.logger.log('[IntentionService.getByDate] before Sequelize findOne');

    return this.intentionModel
      .findOne({
        where: { userId, date },
      })
      .then((result) => {
        this.logger.log(
          '[IntentionService.getByDate] Sequelize findOne succeeded',
        );
        return result;
      })
      .catch((error) => {
        this.logger.error(
          '[IntentionService.getByDate] Sequelize findOne failed',
          this.formatError(error),
        );
        throw error;
      });
  }

  /** Намерения за период — для календаря вместо выгрузки всей истории. */
  getBetween(userId: string, from: string, to: string) {
    return this.intentionModel.findAll({
      where: {
        userId,
        date: { [Op.gte]: from, [Op.lte]: to },
      },
      order: [['date', 'ASC']],
    });
  }

  /** Агрегаты для статистики — считаются в БД, а не выгрузкой всех строк. */
  async getStats(
    userId: string,
  ): Promise<{ total: number; completed: number }> {
    const [total, completed] = await Promise.all([
      this.intentionModel.count({ where: { userId } }),
      this.intentionModel.count({ where: { userId, completed: true } }),
    ]);

    return { total, completed };
  }

  /** Даты активности до указанного дня включительно — для расчёта серии. */
  async getActiveDates(userId: string, until: string): Promise<string[]> {
    this.logger.log(
      '[IntentionService.getActiveDates] before Sequelize findAll',
    );

    try {
      const rows = await this.intentionModel.findAll({
        where: { userId, date: { [Op.lte]: until } },
        attributes: ['date'],
        raw: true,
      });

      this.logger.log(
        '[IntentionService.getActiveDates] Sequelize findAll succeeded',
      );
      return rows.map((row) => row.date);
    } catch (error) {
      this.logger.error(
        '[IntentionService.getActiveDates] Sequelize findAll failed',
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

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { TasbihCounter } from './models/tasbih-counter.model';
import { CreateTasbihCounterDto } from './dto/create-tasbih-counter.dto';
import { UpdateTasbihCounterDto } from './dto/update-tasbih-counter.dto';
import { User } from '../users/models/user.model';
import { todayInZone, safeTimeZone } from '../common/utils/timezone.util';

@Injectable()
export class TasbihService {
  private readonly logger = new Logger(TasbihService.name);

  constructor(
    @InjectModel(TasbihCounter)
    private readonly tasbihCounterModel: typeof TasbihCounter,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  /**
   * Получить все счётчики пользователя.
   * При загрузке проверяет смену дня и пересчитывает дневной прогресс.
   */
  async findAll(userId: string): Promise<TasbihCounter[]> {
    const counters = await this.tasbihCounterModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    // Проверить смену дня для всех счётчиков и пересчитать dailyCompleted
    const timezone = await this.getUserTimezone(userId);
    const today = todayInZone(timezone);
    let hasChanges = false;

    for (const counter of counters) {
      // Проверить смену дня
      if (counter.lastActiveDate !== today) {
        counter.countAtDayStart = counter.count;
        counter.dailyCompleted = 0;
        counter.lastActiveDate = today;
        hasChanges = true;
      }

      // Пересчитать dailyCompleted (на случай, если что-то сбилось)
      if (!counter.isInfinite && counter.target && counter.target > 0) {
        const dayProgress = counter.count - counter.countAtDayStart;
        const newDailyCompleted = Math.floor(dayProgress / counter.target);
        if (newDailyCompleted !== counter.dailyCompleted) {
          counter.dailyCompleted = newDailyCompleted;
          hasChanges = true;
        }
      }
    }

    // Сохранить изменения, если они есть
    if (hasChanges) {
      await Promise.all(counters.map((c) => c.save()));
    }

    return counters;
  }

  /**
   * Получить счётчик по ID (с проверкой принадлежности).
   */
  async findOne(userId: string, id: string): Promise<TasbihCounter> {
    const counter = await this.tasbihCounterModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!counter) {
      throw new NotFoundException('Счётчик не найден');
    }

    return counter;
  }

  /**
   * Получить user по ID (для получения timezone).
   */
  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.userModel.findOne({
      where: { id: userId },
      attributes: ['timezone'],
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found, using UTC`);
      return 'UTC';
    }

    return safeTimeZone(user.timezone);
  }

  /**
   * Проверить смену дня и обновить дневные свойства счётчика.
   * Если наступил новый день, сохраняем текущий count как countAtDayStart
   * и сбрасываем dailyCompleted.
   */
  private ensureDayTransition(counter: TasbihCounter, today: string): void {
    if (counter.lastActiveDate !== today) {
      counter.countAtDayStart = counter.count;
      counter.dailyCompleted = 0;
      counter.lastActiveDate = today;
    }
  }

  /**
   * Пересчитать dailyCompleted на основе текущего count и target.
   * Используется после increment или при изменении target.
   */
  private recalculateDailyCompleted(counter: TasbihCounter): void {
    if (counter.isInfinite) {
      counter.dailyCompleted = 0;
    } else if (counter.target && counter.target > 0) {
      const dayProgress = counter.count - counter.countAtDayStart;
      counter.dailyCompleted = Math.floor(dayProgress / counter.target);
    } else {
      counter.dailyCompleted = 0;
    }
  }

  /**
   * Создать новый счётчик.
   */
  async create(
    userId: string,
    dto: CreateTasbihCounterDto,
  ): Promise<TasbihCounter> {
    const timezone = await this.getUserTimezone(userId);
    const today = todayInZone(timezone);

    return this.tasbihCounterModel.create({
      userId,
      name: dto.name,
      target: dto.isInfinite ? null : dto.target,
      count: dto.count ?? 0,
      isInfinite: dto.isInfinite ?? false,
      countAtDayStart: 0,
      dailyCompleted: 0,
      lastActiveDate: today,
    } as TasbihCounter);
  }

  /**
   * Обновить счётчик.
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateTasbihCounterDto,
  ): Promise<TasbihCounter> {
    const counter = await this.findOne(userId, id);
    const timezone = await this.getUserTimezone(userId);
    const today = todayInZone(timezone);

    // Проверить смену дня
    this.ensureDayTransition(counter, today);

    if (dto.name !== undefined) {
      counter.name = dto.name;
    }

    // Отслеживаем, изменился ли target или count, для пересчёта dailyCompleted
    let needsRecalculation = false;

    if (dto.isInfinite !== undefined) {
      counter.isInfinite = dto.isInfinite;
      // Если переводим в бесконечный, обнуляем target и dailyCompleted
      if (dto.isInfinite) {
        counter.target = null;
        counter.dailyCompleted = 0;
      } else if (dto.target !== undefined) {
        counter.target = dto.target;
        needsRecalculation = true;
      }
    } else if (dto.target !== undefined) {
      counter.target = dto.target;
      needsRecalculation = true;
    }

    if (dto.count !== undefined) {
      counter.count = dto.count;
      needsRecalculation = true;
    }

    // Пересчитать dailyCompleted если изменился target или count
    // countAtDayStart НЕ изменяется при редактировании!
    if (needsRecalculation) {
      this.recalculateDailyCompleted(counter);
    }

    await counter.save();
    return counter;
  }

  /**
   * Удалить счётчик.
   */
  async remove(userId: string, id: string): Promise<void> {
    const counter = await this.findOne(userId, id);
    await counter.destroy();
  }

  /**
   * Увеличить count на 1.
   */
  async increment(userId: string, id: string): Promise<TasbihCounter> {
    const counter = await this.findOne(userId, id);
    const timezone = await this.getUserTimezone(userId);
    const today = todayInZone(timezone);

    // Проверить смену дня
    this.ensureDayTransition(counter, today);

    counter.count += 1;

    // Пересчитать dailyCompleted
    this.recalculateDailyCompleted(counter);

    await counter.save();
    return counter;
  }

  /**
   * Сбросить count в 0.
   */
  async reset(userId: string, id: string): Promise<TasbihCounter> {
    const counter = await this.findOne(userId, id);
    const timezone = await this.getUserTimezone(userId);
    const today = todayInZone(timezone);

    counter.count = 0;
    counter.countAtDayStart = 0;
    counter.dailyCompleted = 0;
    counter.lastActiveDate = today;

    await counter.save();
    return counter;
  }
}

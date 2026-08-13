import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { TasbihCounter } from './models/tasbih-counter.model';
import { CreateTasbihCounterDto } from './dto/create-tasbih-counter.dto';
import { UpdateTasbihCounterDto } from './dto/update-tasbih-counter.dto';

@Injectable()
export class TasbihService {
  private readonly logger = new Logger(TasbihService.name);

  constructor(
    @InjectModel(TasbihCounter)
    private readonly tasbihCounterModel: typeof TasbihCounter,
  ) {}

  /**
   * Получить все счётчики пользователя.
   */
  async findAll(userId: string): Promise<TasbihCounter[]> {
    return this.tasbihCounterModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
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
   * Создать новый счётчик.
   */
  async create(
    userId: string,
    dto: CreateTasbihCounterDto,
  ): Promise<TasbihCounter> {
    return this.tasbihCounterModel.create({
      userId,
      name: dto.name,
      target: dto.isInfinite ? null : dto.target,
      count: dto.count ?? 0,
      isInfinite: dto.isInfinite ?? false,
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

    if (dto.name !== undefined) {
      counter.name = dto.name;
    }

    if (dto.isInfinite !== undefined) {
      counter.isInfinite = dto.isInfinite;
      // Если переводим в бесконечный, обнуляем target
      if (dto.isInfinite) {
        counter.target = null;
      } else if (dto.target !== undefined) {
        counter.target = dto.target;
      }
    } else if (dto.target !== undefined) {
      counter.target = dto.target;
    }

    if (dto.count !== undefined) {
      counter.count = dto.count;
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
    counter.count += 1;
    await counter.save();
    return counter;
  }

  /**
   * Сбросить count в 0.
   */
  async reset(userId: string, id: string): Promise<TasbihCounter> {
    const counter = await this.findOne(userId, id);
    counter.count = 0;
    await counter.save();
    return counter;
  }
}

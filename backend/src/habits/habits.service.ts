import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError } from 'sequelize';

import { Habit } from './models/habit.model';
import { HabitCompletion } from './models/habit-completion.model';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit)
    private readonly habitModel: typeof Habit,
    @InjectModel(HabitCompletion)
    private readonly habitCompletionModel: typeof HabitCompletion,
    private readonly sequelize: Sequelize,
  ) {}

  async create(userId: string, timezone: string, dto: CreateHabitDto) {
    this.assertPeriodValid(dto.startDate, dto.endDate, dto.periodType);

    const habit = await this.habitModel.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      icon: dto.icon,
      color: dto.color,
      periodType: dto.periodType,
      customPeriodDays: dto.customPeriodDays ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isArchived: dto.isArchived ?? false,
    } as Partial<Habit> as Habit);

    return this.findOne(userId, timezone, habit.id);
  }

  async findAll(userId: string, timezone: string) {
    const habits = await this.habitModel.findAll({
      where: { userId },
      include: [{ model: this.habitCompletionModel, required: false }],
      order: [['createdAt', 'DESC']],
    });

    return habits.map((habit) => this.buildHabitView(habit, timezone));
  }

  async findOne(userId: string, timezone: string, id: string) {
    const habit = await this.habitModel.findOne({
      where: { userId, id },
      include: [{ model: this.habitCompletionModel, required: false }],
    });

    if (!habit) {
      throw new NotFoundException('Привычка не найдена');
    }

    return this.buildHabitView(habit, timezone);
  }

  async update(
    userId: string,
    timezone: string,
    id: string,
    dto: UpdateHabitDto,
  ) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Привычка не найдена');
    }

    const startDate = dto.startDate ?? habit.startDate;
    const endDate = dto.endDate ?? habit.endDate;
    const periodType = dto.periodType ?? habit.periodType;
    const periodChanged =
      dto.periodType !== undefined ||
      dto.startDate !== undefined ||
      dto.endDate !== undefined;
    if (periodChanged) {
      this.assertPeriodValid(startDate, endDate, periodType);
    }

    if (dto.title !== undefined) habit.title = dto.title;
    // `?? habit.description` не давал очистить описание — теперь это возможно
    if (dto.description !== undefined) {
      habit.description = dto.description ?? null;
    }
    if (dto.icon !== undefined) habit.icon = dto.icon;
    if (dto.color !== undefined) habit.color = dto.color;
    if (dto.periodType !== undefined) habit.periodType = dto.periodType;
    if (dto.customPeriodDays !== undefined) {
      habit.customPeriodDays = dto.customPeriodDays ?? null;
    }
    if (dto.startDate !== undefined) habit.startDate = dto.startDate;
    if (dto.endDate !== undefined) habit.endDate = dto.endDate;
    if (dto.isArchived !== undefined) habit.isArchived = dto.isArchived;

    await habit.save();

    return this.findOne(userId, timezone, id);
  }

  /** Удаление привычки и её отметок — в одной транзакции. */
  async remove(userId: string, id: string) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Привычка не найдена');
    }

    await this.sequelize.transaction(async (transaction) => {
      await this.habitCompletionModel.destroy({
        where: { habitId: id },
        transaction,
      });
      await habit.destroy({ transaction });
    });

    return { deleted: true };
  }

  /**
   * Отмечает привычку выполненной сегодня или снимает отметку.
   * День берётся в зоне пользователя, а не в UTC — иначе вечерняя отметка
   * у пользователя в UTC+3 попадала бы на следующий день.
   */
  async toggle(userId: string, timezone: string, id: string) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Привычка не найдена');
    }

    if (habit.isSuspended) {
      throw new ForbiddenException('Привычка приостановлена');
    }

    const completedDate = todayInZone(timezone);

    const existing = await this.habitCompletionModel.findOne({
      where: { habitId: id, completedDate },
    });

    if (existing) {
      await existing.destroy();
      return this.findOne(userId, timezone, id);
    }

    try {
      await this.habitCompletionModel.create({
        habitId: id,
        completedDate,
      } as Partial<HabitCompletion> as HabitCompletion);
    } catch (error) {
      // Двойной тап: отметку уже создал параллельный запрос — это не ошибка
      if (!(error instanceof UniqueConstraintError)) {
        throw error;
      }
    }

    return this.findOne(userId, timezone, id);
  }

  async suspend(userId: string, timezone: string, id: string) {
    const habit = await this.habitModel.findOne({
      where: { userId, id },
      include: [{ model: this.habitCompletionModel, required: false }],
    });

    if (!habit) {
      throw new NotFoundException('Привычка не найдена');
    }

    if (this.shouldSuspendHabit(habit, timezone)) {
      habit.isSuspended = true;
      await habit.save();
    }

    return this.findOne(userId, timezone, id);
  }

  async reactivate(userId: string, timezone: string, id: string) {
    const [updatedCount] = await this.habitModel.update(
      {
        isSuspended: false,
        reactivationUsed: true,
      },
      {
        where: {
          userId,
          id,
          isSuspended: true,
          reactivationUsed: false,
        },
      },
    );

    if (updatedCount === 0) {
      const habit = await this.habitModel.findOne({ where: { userId, id } });

      if (!habit) {
        throw new NotFoundException('Привычка не найдена');
      }

      if (habit.reactivationUsed) {
        throw new ConflictException('Повторная активация уже использована');
      }

      throw new BadRequestException('Привычка не приостановлена');
    }

    return this.findOne(userId, timezone, id);
  }

  private assertPeriodValid(
    startDate: string,
    endDate: string,
    periodType: Habit['periodType'],
  ): void {
    if (endDate < startDate) {
      throw new BadRequestException(
        'Дата окончания не может быть раньше даты начала',
      );
    }

    const totalDays = this.calculateTotalDays(startDate, endDate);
    if (periodType === 'CUSTOM') {
      if (totalDays < 30 || totalDays > 365) {
        throw new BadRequestException(
          'CUSTOM-период должен быть от 30 до 365 дней',
        );
      }
      return;
    }

    const expectedDays: Record<string, number> = {
      '30_DAYS': 30,
      '60_DAYS': 60,
      '3_MONTHS': 90,
      '6_MONTHS': 180,
      '1_YEAR': 365,
    };
    const expected = expectedDays[periodType];
    if (expected !== undefined && totalDays !== expected) {
      throw new BadRequestException(
        `Период ${periodType} должен содержать ровно ${expected} дней`,
      );
    }
  }

  private buildHabitView(habit: Habit, timezone: string) {
    const completions = habit.completions ?? [];

    const totalDays = this.calculateTotalDays(habit.startDate, habit.endDate);
    const completedDays = new Set(completions.map((item) => item.completedDate))
      .size;

    const remainingDays = Math.max(0, totalDays - completedDays);
    const progress =
      totalDays > 0
        ? Math.min(100, Math.floor((completedDays / totalDays) * 100))
        : 0;

    const today = todayInZone(timezone);

    return {
      id: habit.id,
      userId: habit.userId,
      title: habit.title,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      periodType: habit.periodType,
      customPeriodDays: habit.customPeriodDays,
      startDate: habit.startDate,
      endDate: habit.endDate,
      isArchived: habit.isArchived,
      isSuspended: habit.isSuspended,
      reactivationUsed: habit.reactivationUsed,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      completedDays,
      totalDays,
      progress,
      remainingDays,
      isCompletedToday: completions.some(
        (item) => item.completedDate === today,
      ),
      isCompleted: completedDays >= totalDays,
      completions: completions.map((completion) => ({
        id: completion.id,
        completedDate: completion.completedDate,
      })),
    };
  }

  /** Длина периода в днях по календарным датам, включая обе границы. */
  private calculateTotalDays(startDate: string, endDate: string): number {
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const start = Date.UTC(startYear, startMonth - 1, startDay);
    const end = Date.UTC(endYear, endMonth - 1, endDay);

    const diffInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(1, diffInDays);
  }

  private shouldSuspendHabit(habit: Habit, timezone: string): boolean {
    const today = todayInZone(timezone);
    const yesterday = this.shiftDate(today, -1);
    const periodEnd = habit.endDate < yesterday ? habit.endDate : yesterday;

    if (habit.startDate > periodEnd) return false;

    const completedDates = new Set(
      (habit.completions ?? []).map((completion) => completion.completedDate),
    );
    let missedDays = 0;
    let currentDate = habit.startDate;

    while (currentDate <= periodEnd) {
      if (!completedDates.has(currentDate)) missedDays += 1;
      currentDate = this.shiftDate(currentDate, 1);
    }

    return missedDays > this.getHabitMissLimit(habit);
  }

  private getHabitMissLimit(habit: Habit): number {
    const totalDays = this.calculateTotalDays(habit.startDate, habit.endDate);
    const points = [
      { days: 30, limit: 2 },
      { days: 60, limit: 5 },
      { days: 90, limit: 8 },
      { days: 180, limit: 15 },
      { days: 365, limit: 30 },
    ];

    if (totalDays <= points[0].days) return points[0].limit;
    if (totalDays >= points[points.length - 1].days) {
      return points[points.length - 1].limit;
    }

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      if (totalDays <= current.days) {
        const ratio =
          (totalDays - previous.days) / (current.days - previous.days);
        return Math.round(
          previous.limit + ratio * (current.limit - previous.limit),
        );
      }
    }

    return points[points.length - 1].limit;
  }

  private shiftDate(dateKey: string, days: number): string {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
}

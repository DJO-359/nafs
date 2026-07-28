import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Habit, PeriodType } from './models/habit.model';
import { HabitCompletion } from './models/habit-completion.model';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit)
    private readonly habitModel: typeof Habit,
    @InjectModel(HabitCompletion)
    private readonly habitCompletionModel: typeof HabitCompletion,
  ) {}

  async create(userId: string, dto: CreateHabitDto) {
    const startDate = dto.startDate;
    const endDate = dto.endDate;

    const habit = await this.habitModel.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      icon: dto.icon,
      color: dto.color,
      periodType: dto.periodType,
      customPeriodDays: dto.customPeriodDays ?? null,
      startDate,
      endDate,
      isArchived: dto.isArchived ?? false,
    } as Habit);

    return this.findOne(userId, habit.id);
  }

  async findAll(userId: string) {
    const habits = await this.habitModel.findAll({
      where: { userId },
      include: [{ model: this.habitCompletionModel, required: false }],
      order: [['createdAt', 'DESC']],
    });

    return habits.map((habit) => this.buildHabitView(habit));
  }

  async findOne(userId: string, id: string) {
    const habit = await this.habitModel.findOne({
      where: { userId, id },
      include: [{ model: this.habitCompletionModel, required: false }],
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return this.buildHabitView(habit);
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    Object.assign(habit, {
      title: dto.title ?? habit.title,
      description: dto.description ?? habit.description,
      icon: dto.icon ?? habit.icon,
      color: dto.color ?? habit.color,
      periodType: dto.periodType ?? habit.periodType,
      customPeriodDays: dto.customPeriodDays ?? habit.customPeriodDays,
      startDate: dto.startDate ?? habit.startDate,
      endDate: dto.endDate ?? habit.endDate,
      isArchived: dto.isArchived ?? habit.isArchived,
    });

    await habit.save();

    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    await this.habitCompletionModel.destroy({ where: { habitId: id } });
    await habit.destroy();

    return { deleted: true };
  }

  async toggle(userId: string, id: string) {
    const habit = await this.habitModel.findOne({ where: { userId, id } });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const completedDate = new Date().toISOString().split('T')[0];

    const existingCompletion = await this.habitCompletionModel.findOne({
      where: { habitId: id, completedDate },
    });

    if (existingCompletion) {
      await existingCompletion.destroy();
      return this.findOne(userId, id);
    }

    await this.habitCompletionModel.create({
      habitId: id,
      completedDate,
    } as HabitCompletion);

    return this.findOne(userId, id);
  }

  private buildHabitView(habit: Habit & { completions?: HabitCompletion[] }) {
    const totalDays = this.calculateTotalDays(
      habit.startDate,
      habit.endDate,
      habit.periodType,
      habit.customPeriodDays,
    );
    const completedDays = habit.completions?.length ?? 0;
    const progress =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = (habit.completions ?? []).some(
      (item) => item.completedDate === today,
    );
    const remainingDays = this.calculateRemainingDays(habit.endDate);

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
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      completedDays,
      totalDays,
      progress,
      remainingDays,
      isCompletedToday,
      completions: (habit.completions ?? []).map((completion) => ({
        id: completion.id,
        completedDate: completion.completedDate,
      })),
    };
  }

  private calculateTotalDays(
    startDate: string,
    endDate: string,
    periodType: PeriodType,
    customPeriodDays?: number | null,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    if (periodType === PeriodType.CUSTOM && customPeriodDays) {
      return Math.max(1, customPeriodDays);
    }

    return diff;
  }

  private calculateRemainingDays(endDate: string) {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.round(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }
}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { Habit } from './models/habit.model';
import { HabitCompletion } from './models/habit-completion.model';

@Module({
  imports: [SequelizeModule.forFeature([Habit, HabitCompletion])],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}

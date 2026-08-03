import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';

import { Habit } from './habit.model';

@Table({
  tableName: 'habit_completions',
  timestamps: true,
  updatedAt: false,
  indexes: [
    // Одна отметка на привычку в день: без этого двойной тап создавал дубли,
    // которые прятались за Set() при подсчёте, но копились в базе
    {
      unique: true,
      fields: ['habitId', 'completedDate'],
      name: 'habit_completions_habit_date_uk',
    },
  ],
})
export class HabitCompletion extends Model<HabitCompletion> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Habit)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare habitId: string;

  @BelongsTo(() => Habit, { onDelete: 'CASCADE' })
  declare habit: Habit;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare completedDate: string;

  @CreatedAt
  declare createdAt: Date;
}

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

  @BelongsTo(() => Habit)
  declare habit: Habit;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare completedDate: string;

  @CreatedAt
  declare createdAt: Date;
}

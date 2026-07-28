import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { User } from '../../users/models/user.model';
import { HabitCompletion } from './habit-completion.model';

export enum PeriodType {
  THIRTY_DAYS = '30_DAYS',
  THREE_MONTHS = '3_MONTHS',
  SIX_MONTHS = '6_MONTHS',
  ONE_YEAR = '1_YEAR',
  CUSTOM = 'CUSTOM',
}

@Table({
  tableName: 'habits',
  timestamps: true,
})
export class Habit extends Model<Habit> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare icon: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare color: string;

  @Column({
    type: DataType.ENUM(...Object.values(PeriodType)),
    allowNull: false,
  })
  declare periodType: PeriodType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare customPeriodDays: number | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare startDate: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare endDate: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isArchived: boolean;

  @HasMany(() => HabitCompletion)
  declare completions: HabitCompletion[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

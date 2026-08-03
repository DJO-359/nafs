import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { ReminderRepeatType } from '../enums/reminder-repeat-type.enum';
import { User } from '../../users/models/user.model';

@Table({
  tableName: 'reminders',
  timestamps: true,
  indexes: [
    // Выборка напоминаний пользователя на экране дня
    { fields: ['userId', 'remindAt'], name: 'reminders_user_remind_at_idx' },
    // Выборка планировщиком раз в минуту по всей таблице
    {
      fields: ['completed', 'remindAt'],
      name: 'reminders_completed_remind_at_idx',
    },
    { fields: ['snoozedUntil'], name: 'reminders_snoozed_until_idx' },
  ],
})
export class Reminder extends Model<Reminder> {
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

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
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
    type: DataType.DATE,
    allowNull: false,
  })
  declare remindAt: Date;

  @Column({
    type: DataType.ENUM(...Object.values(ReminderRepeatType)),
    defaultValue: ReminderRepeatType.NONE,
  })
  declare repeatType: ReminderRepeatType;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  declare repeatInterval: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare repeatDays: number[] | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastTriggeredAt: Date | null;

  /**
   * Отложенная отправка («через час», «завтра»).
   * Отдельное поле, чтобы перенос не ломал расписание повтора: раньше
   * «через час» на ежедневном напоминании давало «завтра + 1 час».
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare snoozedUntil: Date | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare completed: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

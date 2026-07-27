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
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';

import { Reminder } from '../../reminders/models/reminder.model';
import { DiaryEntry } from '../../diary/models/diary-entry.model';

export enum AuthProvider {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare email: string | null;

  @Column(DataType.STRING)
  declare passwordHash: string | null;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  declare telegramId: string | null;

  @Column(DataType.STRING)
  declare username: string | null;

  @Column(DataType.STRING)
  declare firstName: string | null;

  @Column(DataType.STRING)
  declare lastName: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(AuthProvider)),
    defaultValue: AuthProvider.TELEGRAM,
  })
  declare authProvider: AuthProvider;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => Reminder)
  declare reminders: Reminder[];

  @HasMany(() => DiaryEntry)
  declare diaryEntries: DiaryEntry[];
}

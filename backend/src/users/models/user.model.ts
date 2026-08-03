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
import { Intention } from '../../intention/models/intention.model';
import { Habit } from '../../habits/models/habit.model';
import { DEFAULT_TIMEZONE } from '../../common/utils/timezone.util';

export enum AuthProvider {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Table({
  tableName: 'users',
  timestamps: true,
  // Секреты не должны уезжать наружу даже по недосмотру в новом эндпоинте
  defaultScope: {
    attributes: { exclude: ['passwordHash'] },
  },
  scopes: {
    withSecrets: {},
  },
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

  /**
   * Часовой пояс пользователя (IANA). От него считается «сегодня»,
   * границы суток, серия дней и время срабатывания повторов.
   */
  @Default(DEFAULT_TIMEZONE)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare timezone: string;

  /**
   * Момент, когда бот получил от Telegram 403 (пользователь заблокировал бота).
   * Пока заполнено — напоминания в Telegram не отправляются.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare telegramBlockedAt: Date | null;

  @Column({
    type: DataType.ENUM(...Object.values(AuthProvider)),
    defaultValue: AuthProvider.TELEGRAM,
  })
  declare authProvider: AuthProvider;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => Reminder, { onDelete: 'CASCADE', hooks: true })
  declare reminders: Reminder[];

  @HasMany(() => DiaryEntry, { onDelete: 'CASCADE', hooks: true })
  declare diaryEntries: DiaryEntry[];

  @HasMany(() => Intention, { onDelete: 'CASCADE', hooks: true })
  declare intentions: Intention[];

  @HasMany(() => Habit, { onDelete: 'CASCADE', hooks: true })
  declare habits: Habit[];
}

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { User } from '../../users/models/user.model';

@Table({
  tableName: 'diary_entries',
  timestamps: true,
  indexes: [
    {
      unique: false,
      fields: ['userId', 'date'],
      name: 'diary_entries_user_date_idx',
    },
  ],
})
export class DiaryEntry extends Model<DiaryEntry> {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '#ffffff',
  })
  declare color: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isPinned: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare pinEmoji: string | null;

  /**
   * День записи в часовом поясе пользователя (YYYY-MM-DD).
   */
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare date: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

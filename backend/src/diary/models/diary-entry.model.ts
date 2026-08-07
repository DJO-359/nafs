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
    // Несколько записей дневника на один день пользователя
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

  /**
   * День записи в часовом поясе пользователя (YYYY-MM-DD).
   * Раньше «день» выводился из createdAt, поэтому запись задним числом была
   * невозможна, а у пользователя в UTC+3 вечерняя запись попадала во вчера.
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

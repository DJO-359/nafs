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
import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

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
export class DiaryEntry extends Model<
  InferAttributes<DiaryEntry>,
  InferCreationAttributes<DiaryEntry>
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: CreationOptional<string>;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  declare user: CreationOptional<User>;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  /**
   * День записи в часовом поясе пользователя (YYYY-MM-DD)
   */
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare date: string;

  @CreatedAt
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  declare updatedAt: CreationOptional<Date>;
}

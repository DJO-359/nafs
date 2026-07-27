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
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table({
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'name'], // каждый пользователь может иметь только одну категорию с данным именем
    },
  ],
})
export class Category extends Model<Category, Partial<Category>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
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
  declare name: string;

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

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

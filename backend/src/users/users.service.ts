import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create({
      ...createUserDto,
    } as User);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { telegramId },
    });
  }

  /**
   * Обновляет пользователя по telegramId или создаёт нового,
   * если пользователь с таким telegramId не найден.
   * @param telegramId - Telegram ID пользователя
   * @param data - данные для обновления (username, firstName)
   * @returns Обновлённый или созданный пользователь
   */
  async updateTelegramUser(
    telegramId: string,
    data: {
      username: string | null;
      firstName: string | null;
    },
  ): Promise<User> {
    const user = await this.userModel.findOne({
      where: { telegramId },
    });

    if (user) {
      return user.update(data);
    }

    return this.userModel.create({
      telegramId,
      username: data.username,
      firstName: data.firstName,
      authProvider: 'telegram',
    } as User);
  }
}

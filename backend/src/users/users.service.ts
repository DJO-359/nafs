import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { User, AuthProvider } from './models/user.model';
import { safeTimeZone } from '../common/utils/timezone.util';

export interface UpsertTelegramUserInput {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  timezone: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ where: { telegramId } });
  }

  /**
   * Создаёт пользователя или обновляет профиль существующего.
   * Единственная точка появления пользователей в системе — вызывается
   * из AuthService после проверки подписи initData.
   */
  async upsertTelegramUser(input: UpsertTelegramUserInput): Promise<User> {
    const existing = await this.findByTelegramId(input.telegramId);

    if (existing) {
      existing.username = input.username;
      existing.firstName = input.firstName;
      existing.lastName = input.lastName;
      existing.timezone = safeTimeZone(input.timezone);

      // Пользователь снова открыл приложение — значит бот не заблокирован
      existing.telegramBlockedAt = null;

      await existing.save();
      return existing;
    }

    return this.userModel.create({
      telegramId: input.telegramId,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      timezone: safeTimeZone(input.timezone),
      authProvider: AuthProvider.TELEGRAM,
    } as Partial<User> as User);
  }

  /**
   * Обновляет профиль по данным из Telegram-бота (команда /start).
   * Пользователя не создаёт: аккаунт заводится только через проверенный initData.
   */
  async updateTelegramProfile(
    telegramId: string,
    data: { username: string | null; firstName: string | null },
  ): Promise<User | null> {
    const user = await this.findByTelegramId(telegramId);

    if (!user) {
      return null;
    }

    user.username = data.username;
    user.firstName = data.firstName;
    user.telegramBlockedAt = null;

    await user.save();
    return user;
  }

  /** Отмечает, что бот заблокирован пользователем — рассылку ему прекращаем. */
  async markTelegramBlocked(userId: string): Promise<void> {
    await this.userModel.update(
      { telegramBlockedAt: new Date() },
      { where: { id: userId } },
    );
  }

  async updateTimezone(userId: string, timezone: string): Promise<void> {
    await this.userModel.update(
      { timezone: safeTimeZone(timezone) },
      { where: { id: userId } },
    );
  }
}

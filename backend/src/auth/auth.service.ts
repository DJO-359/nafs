import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { User } from '../users/models/user.model';
import {
  TelegramInitDataService,
  TelegramInitDataUser,
} from './telegram-init-data.service';
import { safeTimeZone } from '../common/utils/timezone.util';

export interface AuthResult {
  user: {
    id: string;
    telegramId: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    timezone: string;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly initDataService: TelegramInitDataService,
  ) {}

  /**
   * Вход в Mini App. Личность пользователя берётся только из подписанной
   * Telegram строки initData — телу запроса не доверяем.
   */
  async authenticateTelegram(dto: TelegramAuthDto): Promise<AuthResult> {
    const telegramUser = this.initDataService.validate(dto.initData);

    return this.issueToken(telegramUser, dto.timezone);
  }

  /**
   * Вход для локальной разработки вне Telegram.
   * Работает, только если задан DEV_TELEGRAM_ID и NODE_ENV !== production.
   */
  async authenticateDev(timezone?: string): Promise<AuthResult> {
    if (!this.isDevLoginEnabled()) {
      throw new UnauthorizedException('Dev-вход отключён');
    }

    const devTelegramId =
      this.configService.getOrThrow<string>('DEV_TELEGRAM_ID');

    this.logger.warn(`Dev-вход под telegramId=${devTelegramId}`);

    return this.issueToken(
      {
        id: devTelegramId,
        username: 'dev',
        firstName: 'Dev',
        lastName: null,
        languageCode: 'ru',
      },
      timezone,
    );
  }

  isDevLoginEnabled(): boolean {
    return (
      this.configService.get<string>('NODE_ENV') !== 'production' &&
      Boolean(this.configService.get<string>('DEV_TELEGRAM_ID'))
    );
  }

  private async issueToken(
    telegramUser: TelegramInitDataUser,
    requestedTimezone?: string,
  ): Promise<AuthResult> {
    const user = await this.usersService.upsertTelegramUser({
      telegramId: telegramUser.id,
      username: telegramUser.username,
      firstName: telegramUser.firstName,
      lastName: telegramUser.lastName,
      timezone: safeTimeZone(requestedTimezone),
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
    };
  }

  private toPublicUser(user: User): AuthResult['user'] {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
    };
  }
}

import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { DevAuthDto } from './dto/dev-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Вход по подписанной строке Telegram initData.
   * Лимит жёстче общего, потому что эндпоинт публичный и создаёт пользователей.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('telegram')
  async loginWithTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.authenticateTelegram(dto);
  }

  /**
   * Вход для локальной разработки вне Telegram.
   * В production отвечает 404 — маршрут не должен выдавать своё существование.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('dev')
  async loginDev(@Body() dto: DevAuthDto) {
    if (!this.authService.isDevLoginEnabled()) {
      throw new NotFoundException();
    }

    return this.authService.authenticateDev(dto.timezone);
  }
}

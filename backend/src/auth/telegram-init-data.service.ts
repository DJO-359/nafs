import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Пользователь, распакованный из подписанной Telegram строки initData. */
export interface TelegramInitDataUser {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
}

interface RawTelegramUser {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

/** Максимальный возраст initData. Дальше строку считаем протухшей. */
const MAX_AUTH_AGE_SECONDS = 3600;

/**
 * Проверка подлинности Telegram Mini App initData.
 *
 * Раньше бэкенд принимал telegramId прямо из тела запроса и сразу выдавал JWT —
 * то есть любой мог получить токен от имени любого пользователя, потому что
 * Telegram ID является публичным значением. Здесь строка проверяется по
 * алгоритму из документации Telegram: подпись HMAC-SHA256 на секрете,
 * производном от токена бота.
 */
@Injectable()
export class TelegramInitDataService {
  private readonly logger = new Logger(TelegramInitDataService.name);
  private readonly secretKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const botToken =
      this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    // secret_key = HMAC_SHA256(<bot_token>, "WebAppData")
    this.secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
  }

  /**
   * Проверяет подпись и возвращает пользователя.
   * Бросает UnauthorizedException, если подпись неверна или строка протухла.
   */
  validate(initData: string): TelegramInitDataUser {
    const params = new URLSearchParams(initData);

    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException('initData не содержит подпись');
    }

    // В data_check_string входят все пары, кроме hash, отсортированные по ключу
    const dataCheckString = [...params.entries()]
      .filter(([key]) => key !== 'hash')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const computed = createHmac('sha256', this.secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!this.safeCompare(computed, hash)) {
      this.logger.warn('Отклонена initData с неверной подписью');
      throw new UnauthorizedException('Подпись initData неверна');
    }

    this.assertFresh(params.get('auth_date'));

    return this.extractUser(params.get('user'));
  }

  /** Сравнение за постоянное время, чтобы не утекало по таймингу. */
  private safeCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'utf8');
    const rightBuffer = Buffer.from(right, 'utf8');

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private assertFresh(authDate: string | null): void {
    if (!authDate) {
      throw new UnauthorizedException('initData не содержит auth_date');
    }

    const authDateSeconds = Number(authDate);
    if (!Number.isFinite(authDateSeconds)) {
      throw new UnauthorizedException('Некорректный auth_date');
    }

    const ageSeconds = Math.floor(Date.now() / 1000) - authDateSeconds;

    if (ageSeconds > MAX_AUTH_AGE_SECONDS) {
      throw new UnauthorizedException(
        'Сессия Telegram устарела, откройте приложение заново',
      );
    }
  }

  private extractUser(rawUser: string | null): TelegramInitDataUser {
    if (!rawUser) {
      throw new UnauthorizedException(
        'initData не содержит данные пользователя',
      );
    }

    let parsed: RawTelegramUser;

    try {
      parsed = JSON.parse(rawUser) as RawTelegramUser;
    } catch {
      throw new UnauthorizedException(
        'Не удалось разобрать данные пользователя',
      );
    }

    if (typeof parsed.id !== 'number') {
      throw new UnauthorizedException(
        'В initData нет идентификатора пользователя',
      );
    }

    return {
      id: String(parsed.id),
      username: parsed.username ?? null,
      firstName: parsed.first_name ?? null,
      lastName: parsed.last_name ?? null,
      languageCode: parsed.language_code ?? null,
    };
  }
}

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

/** Результат отправки — вызывающая сторона должна различать причины неудачи. */
export type SendResult =
  | { status: 'sent' }
  | { status: 'blocked' }
  | { status: 'rate-limited'; retryAfterSeconds: number }
  | { status: 'failed' };

interface TelegramApiError {
  response?: {
    statusCode?: number;
    body?: {
      error_code?: number;
      description?: string;
      parameters?: { retry_after?: number };
    };
  };
}

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<boolean>('TELEGRAM_ENABLED') !== false;
  }

  /**
   * Бот поднимается в onModuleInit, а не в конструкторе: ошибка здесь не должна
   * ронять весь HTTP API, а polling обязан останавливаться при завершении.
   */
  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.warn(
        'TELEGRAM_ENABLED=false — бот не запущен. Локально так и нужно: ' +
          'второй polling конфликтует с продовым, Telegram отдаёт 409.',
      );
      return;
    }

    const token = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    this.bot = new TelegramBot(token, {
      polling: {
        interval: 3000,
        params: { allowed_updates: ['message', 'callback_query'] },
      },
    });

    this.bot.on('polling_error', (error) => {
      this.logger.error(`Ошибка polling: ${error.message}`);
    });

    this.logger.log('Telegram-бот запущен (polling)');
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.bot) return;

    try {
      await this.bot.stopPolling({ cancel: true });
      this.logger.log('Polling остановлен');
    } catch (error) {
      this.logger.error('Не удалось остановить polling', error);
    }
  }

  /** Возвращает бота или null, если он отключён настройкой. */
  getBot(): TelegramBot | null {
    return this.bot;
  }

  isEnabled(): boolean {
    return this.enabled && this.bot !== null;
  }

  /**
   * Отправляет сообщение и различает причины неудачи.
   * Раньше любая ошибка сводилась к false, поэтому заблокировавший бота
   * пользователь заставлял планировщик повторять отправку каждую минуту вечно.
   */
  async sendMessage(
    chatId: string,
    text: string,
    reminderId?: string,
  ): Promise<SendResult> {
    if (!this.bot) {
      return { status: 'failed' };
    }

    try {
      await this.bot.sendMessage(chatId, text, {
        reply_markup: reminderId
          ? {
              inline_keyboard: [
                [{ text: '✅ Выполнено', callback_data: `done:${reminderId}` }],
                [{ text: '⏰ Через час', callback_data: `hour:${reminderId}` }],
                [
                  {
                    text: '📅 Завтра',
                    callback_data: `tomorrow:${reminderId}`,
                  },
                ],
              ],
            }
          : undefined,
      });

      return { status: 'sent' };
    } catch (error) {
      return this.classifyError(error, chatId);
    }
  }

  private classifyError(error: unknown, chatId: string): SendResult {
    const apiError = error as TelegramApiError;
    const code =
      apiError.response?.body?.error_code ?? apiError.response?.statusCode;
    const description = apiError.response?.body?.description ?? '';

    // 403 — пользователь заблокировал бота или удалил чат
    if (code === 403) {
      this.logger.warn(`Чат ${chatId} недоступен: ${description}`);
      return { status: 'blocked' };
    }

    // 400 с такими текстами тоже означает, что писать больше некуда
    if (
      code === 400 &&
      /chat not found|user is deactivated/i.test(description)
    ) {
      this.logger.warn(`Чат ${chatId} не существует: ${description}`);
      return { status: 'blocked' };
    }

    if (code === 429) {
      const retryAfterSeconds =
        apiError.response?.body?.parameters?.retry_after ?? 60;

      this.logger.warn(
        `Лимит Telegram для чата ${chatId}, повтор через ${retryAfterSeconds}с`,
      );

      return { status: 'rate-limited', retryAfterSeconds };
    }

    this.logger.error(
      `Ошибка отправки в чат ${chatId}: ${description || String(error)}`,
    );

    return { status: 'failed' };
  }
}

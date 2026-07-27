import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor() {
    // Лог создания сервиса
    this.logger.log('TelegramService CREATED');

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN не задан');
    }

    this.bot = new TelegramBot(token, {
      polling: {
        interval: 3000,
        timeout: 30,
        params: {
          allowed_updates: ['message', 'callback_query'],
        },
      },
      // request.timeoutMs НЕ добавлен (оставлен по умолчанию)
    });

    // Подробное логирование ошибок поллинга
    this.bot.on('polling_error', (error) => {
      this.logger.error('========== TELEGRAM POLLING ERROR ==========');
      this.logger.error(error);

      if (error && typeof error === 'object') {
        this.logger.error(JSON.stringify(error, null, 2));
      }

      this.logger.error('===========================================');
    });
  }

  /**
   * Отправляет сообщение с инлайн-кнопками для управления напоминанием.
   * @param chatId - Telegram chat ID пользователя
   * @param text - Текст сообщения
   * @param reminderId - ID напоминания (если передан, добавляются кнопки)
   * @returns Promise<boolean> - true, если отправлено успешно, иначе false
   */
  async sendMessage(
    chatId: string,
    text: string,
    reminderId?: string,
  ): Promise<boolean> {
    try {
      await this.bot.sendMessage(chatId, text, {
        reply_markup: reminderId
          ? {
              inline_keyboard: [
                [
                  {
                    text: '✅ Выполнено',
                    callback_data: `done:${reminderId}`,
                  },
                ],
                [
                  {
                    text: '⏰ Через час',
                    callback_data: `hour:${reminderId}`,
                  },
                ],
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

      this.logger.log(`Сообщение отправлено в чат ${chatId}`);
      return true;
    } catch (error) {
      this.logger.error(`Ошибка отправки сообщения в чат ${chatId}:`, error);
      return false;
    }
  }

  /**
   * Возвращает экземпляр TelegramBot для настройки обработчиков.
   */
  getBot(): TelegramBot {
    return this.bot;
  }
}

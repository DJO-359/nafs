import {
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
  Inject,
} from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import type { CallbackQuery } from 'node-telegram-bot-api';

import { TelegramService } from './telegram.service';
import { UsersService } from '../users/users.service';
import { RemindersService } from '../reminders/reminders.service';
import { safeTimeZone } from '../common/utils/timezone.util';

type CallbackAction = 'done' | 'hour' | 'tomorrow';

@Injectable()
export class TelegramUpdateService implements OnModuleInit {
  private readonly logger = new Logger(TelegramUpdateService.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => RemindersService))
    private readonly remindersService: RemindersService,
  ) {}

  onModuleInit(): void {
    const bot = this.telegramService.getBot();

    if (!bot) {
      return;
    }

    bot.on('callback_query', (query) => {
      void this.handleCallback(bot, query);
    });

    this.logger.log('Обработчик кнопок Telegram запущен');
  }

  /**
   * Раньше напоминание искалось по findByPk без проверки владельца, а
   * query.from.id не сверялся ни с чем — обойти это мог кастомный клиент,
   * отправив произвольный callback_data. Теперь операция всегда идёт от
   * пользователя, который нажал кнопку.
   */
  private async handleCallback(
    bot: TelegramBot,
    query: CallbackQuery,
  ): Promise<void> {
    try {
      const data = query.data;
      if (!data) return;

      const separatorIndex = data.indexOf(':');
      if (separatorIndex === -1) return;

      const action = data.slice(0, separatorIndex) as CallbackAction;
      const reminderId = data.slice(separatorIndex + 1);

      const telegramId = String(query.from.id);
      const user = await this.usersService.findByTelegramId(telegramId);

      if (!user) {
        await bot.answerCallbackQuery(query.id, {
          text: 'Откройте приложение через /start',
        });
        return;
      }

      const timezone = safeTimeZone(user.timezone);
      const text = await this.applyAction(
        action,
        user.id,
        reminderId,
        timezone,
      );

      if (!text) {
        return;
      }

      await bot.answerCallbackQuery(query.id, { text });
      await this.clearButtons(bot, query);
    } catch (error) {
      this.logger.error(
        'Ошибка обработки callback_query',
        error instanceof Error ? error.stack : String(error),
      );

      try {
        await bot.answerCallbackQuery(query.id, {
          text: 'Не удалось выполнить действие',
        });
      } catch {
        // Отвечать уже некуда — просто не роняем обработчик
      }
    }
  }

  private async applyAction(
    action: CallbackAction,
    userId: string,
    reminderId: string,
    timezone: string,
  ): Promise<string | null> {
    switch (action) {
      case 'done':
        await this.remindersService.complete(userId, reminderId);
        return '✅ Выполнено';

      case 'hour':
        await this.remindersService.snoozeByHours(userId, reminderId, 1);
        return '⏰ Напомню через час';

      case 'tomorrow':
        await this.remindersService.snoozeToTomorrow(
          userId,
          reminderId,
          timezone,
        );
        return '📅 Напомню завтра утром';

      default:
        return null;
    }
  }

  /** Гасим клавиатуру, чтобы повторные нажатия не накапливали переносы. */
  private async clearButtons(
    bot: TelegramBot,
    query: CallbackQuery,
  ): Promise<void> {
    if (!query.message) return;

    try {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
        },
      );
    } catch {
      // Сообщение могло быть удалено пользователем — это не ошибка
    }
  }
}

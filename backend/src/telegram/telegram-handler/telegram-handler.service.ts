import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';

import { UsersService } from '../../users/users.service';
import { TelegramService } from '../telegram.service';
import { TelegramStateService } from '../telegram-state.service';
import { TelegramState } from '../states/telegram-state.enum';
import { DiaryService } from '../../diary/diary.service';
import { safeTimeZone } from '../../common/utils/timezone.util';

@Injectable()
export class TelegramHandlerService implements OnModuleInit {
  private readonly logger = new Logger(TelegramHandlerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly telegramStateService: TelegramStateService,
    private readonly diaryService: DiaryService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const bot = this.telegramService.getBot();

    if (!bot) {
      return;
    }

    bot.onText(/^\/start/, (msg) => {
      void this.handleStart(bot, msg);
    });

    bot.on('message', (msg) => {
      void this.handleMessage(bot, msg);
    });

    this.logger.log('Обработчик сообщений Telegram запущен');
  }

  private async handleStart(bot: TelegramBot, msg: Message): Promise<void> {
    try {
      const telegramId = String(msg.chat.id);

      // Профиль обновляем, но аккаунт здесь не создаём:
      // пользователь появляется только после проверки подписи initData
      await this.usersService.updateTelegramProfile(telegramId, {
        username: msg.from?.username ?? null,
        firstName: msg.from?.first_name ?? null,
      });

      const miniAppUrl = this.configService.getOrThrow<string>('MINI_APP_URL');

      await bot.sendMessage(
        telegramId,
        '👋 Добро пожаловать в Nafs.\n\n🚀 Откройте приложение кнопкой ниже.',
        {
          reply_markup: {
            keyboard: [
              [{ text: '🚀 Открыть Nafs', web_app: { url: miniAppUrl } }],
              [{ text: '📝 Новая запись' }, { text: '📊 Мой день' }],
            ],
            resize_keyboard: true,
            is_persistent: true,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        'Ошибка обработки /start',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async handleMessage(bot: TelegramBot, msg: Message): Promise<void> {
    try {
      const chatId = String(msg.chat.id);
      const text = msg.text?.trim();

      if (!text || text.startsWith('/')) {
        return;
      }

      const user = await this.usersService.findByTelegramId(chatId);

      if (!user) {
        await bot.sendMessage(
          chatId,
          '❌ Сначала откройте приложение кнопкой «🚀 Открыть Nafs» — так создаётся ваш аккаунт.',
        );
        return;
      }

      if (
        this.telegramStateService.getState(chatId) ===
        TelegramState.WAITING_DIARY
      ) {
        await this.diaryService.create(
          user.id,
          safeTimeZone(user.timezone),
          text,
        );
        this.telegramStateService.clearState(chatId);

        await bot.sendMessage(
          chatId,
          '✅ Запись сохранена.\n\nСпасибо, что поделился.',
        );
        return;
      }

      switch (text) {
        case '📝 Новая запись':
          this.telegramStateService.setState(
            chatId,
            TelegramState.WAITING_DIARY,
          );
          await bot.sendMessage(chatId, '📝 Расскажи, что произошло сегодня?');
          return;

        case '📊 Мой день': {
          const entry = await this.diaryService.getLastEntry(user.id);

          await bot.sendMessage(
            chatId,
            entry
              ? `📊 Мой день\n\n📝 Последняя запись (${entry.date}):\n\n${entry.content}`
              : '📊 Мой день\n\nПока нет записей.\n\nНажмите «📝 Новая запись».',
          );
          return;
        }

        default:
          // Раньше здесь не было ветки по умолчанию, и пользователь
          // не получал вообще никакого ответа на обычное сообщение
          await bot.sendMessage(
            chatId,
            'Не понял команду. Откройте приложение кнопкой «🚀 Открыть Nafs» или нажмите «📝 Новая запись».',
          );
          return;
      }
    } catch (error) {
      this.logger.error(
        'Ошибка обработки сообщения',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

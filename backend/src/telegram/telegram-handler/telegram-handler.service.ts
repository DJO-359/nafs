import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import type { Message } from 'node-telegram-bot-api';

import { UsersService } from '../../users/users.service';
import { TelegramService } from '../telegram.service';
import { TelegramStateService } from '../telegram-state.service';
import { TelegramState } from '../states/telegram-state.enum';
import { DiaryService } from '../../diary/diary.service';
import { safeTimeZone } from '../../common/utils/timezone.util';
import { WELCOME_MESSAGE } from '../messages/welcome.message';

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
    this.logger.log('onModuleInit: checking Telegram bot instance');

    if (!bot) {
      this.logger.warn('onModuleInit: Telegram bot instance is not available');
      return;
    }

    bot.onText(/^\/start/, (msg) => {
      this.logger.log(
        `onText /start received: chatId=${msg.chat?.id} text=${msg.text}`,
      );
      void this.handleStart(bot, msg);
    });

    bot.on('message', (msg) => {
      this.logger.log(
        `onMessage received: chatId=${msg.chat?.id} text=${msg.text}`,
      );
      void this.handleMessage(bot, msg);
    });

    this.logger.log('Обработчик сообщений Telegram запущен');
  }

  private async handleStart(bot: TelegramBot, msg: Message): Promise<void> {
    const telegramId = String(msg.chat.id);
    this.logger.log(
      `handleStart: invoked for chatId=${telegramId} text=${msg.text}`,
    );

    try {
      // Профиль обновляем, но аккаунт здесь не создаём:
      // пользователь появляется только после проверки подписи initData
      await this.usersService.updateTelegramProfile(telegramId, {
        username: msg.from?.username ?? null,
        firstName: msg.from?.first_name ?? null,
      });

      const user = await this.usersService.findByTelegramId(telegramId);
      const miniAppUrl = this.configService.getOrThrow<string>('MINI_APP_URL');

      if (!user || !user.welcomeCompleted) {
        this.logger.log(
          `handleStart: sending first-time welcome flow for chatId=${telegramId}`,
        );

        const imagePath = path.resolve(
          __dirname,
          '../../assets/images/welcome.png',
        );

        await bot.sendPhoto(telegramId, imagePath, {
          caption: WELCOME_MESSAGE,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Открыть Nafs', web_app: { url: miniAppUrl } }],
            ],
          },
        });

        if (user) {
          await this.usersService.updateWelcomeCompleted(user.id);
        }

        return;
      }

      this.logger.log(
        `handleStart: sending returning user message for chatId=${telegramId}`,
      );

      await bot.sendMessage(
        telegramId,
        '🌿 С возвращением в Nafs.\n\nСегодня — новый день.\n\nПусть он станет ещё одним шагом к лучшей версии себя.\n\nНажмите кнопку ниже, чтобы открыть приложение.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Открыть Nafs', web_app: { url: miniAppUrl } }],
            ],
          },
        },
      );
    } catch (error) {
      console.dir(error, { depth: null });
      const isSequelizeError =
        error &&
        typeof error === 'object' &&
        'parent' in error &&
        'original' in error &&
        'sql' in error;
      if (isSequelizeError) {
        console.error('Sequelize error details:', {
          message: (error as any).message,
          parent: (error as any).parent,
          original: (error as any).original,
          sql: (error as any).sql,
          parameters: (error as any).parameters,
        });
      }
      this.logger.error(
        `Ошибка обработки /start для chatId=${telegramId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async handleMessage(bot: TelegramBot, msg: Message): Promise<void> {
    try {
      const chatId = String(msg.chat.id);
      const text = msg.text?.trim();
      this.logger.log(
        `handleMessage: invoked for chatId=${chatId} text=${text}`,
      );

      if (!text || text.startsWith('/')) {
        this.logger.log(`handleMessage: ignoring text=${text}`);
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

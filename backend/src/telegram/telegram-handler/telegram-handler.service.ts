import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { existsSync } from 'fs';
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

    bot.on('callback_query', (q) => {
      void this.handleCallback(bot, q);
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

        // Логируем путь и проверяем существование файла
        this.logger.log(`Image path: ${imagePath}`);
        this.logger.log(`File exists: ${existsSync(imagePath)}`);

        await bot.sendPhoto(telegramId, imagePath, {
          caption: WELCOME_MESSAGE,
          reply_markup: {
            inline_keyboard: [
              [{ text: '✨ Начать настройку', callback_data: 'setup:start' }],
            ],
          },
        });

        // Do NOT mark `welcomeCompleted` here. The flag should be set only
        // after the user completes the full setup flow (wake → sleep → reminder).
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

  private async handleCallback(bot: TelegramBot, q: any): Promise<void> {
    try {
      const callbackData = q.data as string | undefined;
      const telegramId = String(q.message?.chat?.id ?? q.from?.id);

      if (!callbackData) {
        await bot.answerCallbackQuery(q.id);
        return;
      }

      const user = await this.usersService.findByTelegramId(telegramId);

      // If user doesn't exist, ask to open app to create account
      if (!user) {
        await bot.answerCallbackQuery(q.id, {
          text: 'Сначала откройте приложение, чтобы создать аккаунт.',
        });
        await bot.sendMessage(
          telegramId,
          'Пожалуйста, откройте приложение кнопкой «🚀 Открыть Nafs», чтобы создать аккаунт.',
        );
        return;
      }

      // callback format: setup:start | setup:wake:07:00 | setup:sleep:23:00 | setup:reminder:yes
      const parts = callbackData.split(':');

      if (parts[0] === 'setup' && parts[1] === 'start') {
        // Step 1: ask wake time
        const times = [
          '06:00',
          '06:30',
          '07:00',
          '07:30',
          '08:00',
          '08:30',
          '09:00',
        ];
        const keyboard = times.map((t) => [
          { text: t, callback_data: `setup:wake:${t}` },
        ]);

        await bot.answerCallbackQuery(q.id);
        await bot.sendMessage(
          telegramId,
          '🌅 Во сколько ты обычно просыпаешься?',
          {
            reply_markup: { inline_keyboard: keyboard },
          },
        );
        this.telegramStateService.setState(
          telegramId,
          TelegramState.SETUP_WAKE,
        );
        return;
      }

      if (parts[0] === 'setup' && parts[1] === 'wake' && parts[2]) {
        const wake = parts[2];
        await this.usersService.updateWakeTime(user.id, wake);
        await bot.answerCallbackQuery(q.id, { text: `Сохранено: ${wake}` });

        // Step 2: ask sleep time
        const times = [
          '21:00',
          '21:30',
          '22:00',
          '22:30',
          '23:00',
          '23:30',
          '00:00',
        ];
        const keyboard = times.map((t) => [
          { text: t, callback_data: `setup:sleep:${t}` },
        ]);
        await bot.sendMessage(
          telegramId,
          '🌙 Во сколько ты обычно ложишься спать?',
          {
            reply_markup: { inline_keyboard: keyboard },
          },
        );
        this.telegramStateService.setState(
          telegramId,
          TelegramState.SETUP_SLEEP,
        );
        return;
      }

      if (parts[0] === 'setup' && parts[1] === 'sleep' && parts[2]) {
        const sleep = parts[2];
        await this.usersService.updateSleepTime(user.id, sleep);
        await bot.answerCallbackQuery(q.id, { text: `Сохранено: ${sleep}` });

        // Step 3: ask evening reminder
        const keyboard = [
          [{ text: '✅ Да', callback_data: `setup:reminder:yes` }],
          [{ text: '❌ Нет', callback_data: `setup:reminder:no` }],
        ];
        await bot.sendMessage(
          telegramId,
          '🔔 Хочешь получать вечернее напоминание перед завершением дня?',
          {
            reply_markup: { inline_keyboard: keyboard },
          },
        );
        this.telegramStateService.setState(
          telegramId,
          TelegramState.SETUP_REMINDER,
        );
        return;
      }

      if (parts[0] === 'setup' && parts[1] === 'reminder' && parts[2]) {
        const enabled = parts[2] === 'yes';
        await this.usersService.updateEveningReminderEnabled(user.id, enabled);
        await bot.answerCallbackQuery(q.id, {
          text: `Сохранено: ${enabled ? 'Да' : 'Нет'}`,
        });

        // Finish
        const miniAppUrl =
          this.configService.getOrThrow<string>('MINI_APP_URL');
        await bot.sendMessage(
          telegramId,
          '🌿 Всё готово.\n\nNafs настроен под твой ритм дня.\n\nТеперь можно открыть приложение.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚀 Открыть Nafs', web_app: { url: miniAppUrl } }],
              ],
            },
          },
        );

        // Mark welcomeCompleted true
        await this.usersService.updateWelcomeCompleted(user.id);
        // Mark onboarding as completed so frontend skips in-app onboarding
        await this.usersService.updateOnboardingCompleted(user.id);
        this.telegramStateService.clearState(telegramId);
        return;
      }

      // Unknown callback
      await bot.answerCallbackQuery(q.id);
    } catch (error) {
      this.logger.error(
        'Ошибка обработки callback_query',
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

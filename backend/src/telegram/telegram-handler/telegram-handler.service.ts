import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { UsersService } from '../../users/users.service';
import { TelegramService } from '../telegram.service';

import { TelegramStateService } from '../telegram-state.service';
import { TelegramState } from '../states/telegram-state.enum';

import { DiaryService } from '../../diary/diary.service';

@Injectable()
export class TelegramHandlerService implements OnModuleInit {
  private readonly logger = new Logger(TelegramHandlerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly telegramStateService: TelegramStateService,
    private readonly diaryService: DiaryService,
  ) {}

  onModuleInit() {
    const bot = this.telegramService.getBot();

    bot.onText(/\/start/, async (msg) => {
      try {
        const telegramId = String(msg.chat.id);

        // Тестовый вызов удалён ✓

        await this.usersService.updateTelegramUser(telegramId, {
          username: msg.from?.username ?? null,
          firstName: msg.from?.first_name ?? null,
        });

        const miniAppUrl =
          process.env.TELEGRAM_WEB_APP_URL ??
          'https://your-mini-app-url.example.com';

        this.logger.log(`Mini App URL: ${miniAppUrl}`);

        await bot.sendMessage(
          telegramId,
          `
👋 Добро пожаловать в Nafs

Telegram подключен.
`,
          {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: '🚀 Открыть Nafs',
                    web_app: {
                      url: miniAppUrl,
                    },
                  },
                ],
                [{ text: '📝 Новая запись' }, { text: '📊 Мой день' }],
                [{ text: '⏰ Напоминания' }, { text: '⚙️ Настройки' }],
              ],
              resize_keyboard: true,
            },
          },
        );
      } catch (error) {
        this.logger.error('Ошибка обработки /start', error);
      }
    });

    // Обработчик всех текстовых сообщений с защитой от ошибок
    bot.on('message', async (msg) => {
      try {
        const chatId = String(msg.chat.id);
        const text = msg.text;

        if (!text) return;

        if (text.startsWith('/')) return;

        if (
          this.telegramStateService.getState(chatId) ===
          TelegramState.WAITING_DIARY
        ) {
          const user = await this.usersService.findByTelegramId(chatId);
          if (!user) {
            await bot.sendMessage(
              chatId,
              '❌ Пользователь не найден. Нажмите /start',
            );
            return;
          }

          await this.diaryService.create(user.id, text);
          this.telegramStateService.clearState(chatId);

          await bot.sendMessage(
            chatId,
            `
✅ Запись сохранена.

Спасибо, что поделился.
`,
          );

          return;
        }

        switch (text) {
          case '📝 Новая запись':
            this.telegramStateService.setState(
              chatId,
              TelegramState.WAITING_DIARY,
            );

            await bot.sendMessage(
              chatId,
              `
📝 Расскажи, что произошло сегодня?
`,
            );

            break;

          case '📊 Мой день': {
            const user = await this.usersService.findByTelegramId(chatId);

            if (!user) {
              await bot.sendMessage(
                chatId,
                '❌ Пользователь не найден. Нажмите /start',
              );
              return;
            }

            const entry = await this.diaryService.getLastEntry(user.id);

            if (!entry) {
              await bot.sendMessage(
                chatId,
                `
📊 Мой день

Пока нет записей.

Нажмите 📝 Новая запись
`,
              );
              return;
            }

            await bot.sendMessage(
              chatId,
              `
📊 Мой день

📝 Последняя запись:

${entry.content}

Продолжай наблюдать за собой.
`,
            );

            break;
          }

          case '⏰ Напоминания':
            await bot.sendMessage(
              chatId,
              `
⏰ Напоминания.
`,
            );

            break;

          case '⚙️ Настройки':
            await bot.sendMessage(
              chatId,
              `
⚙️ Настройки.
`,
            );

            break;
        }
      } catch (error) {
        this.logger.error('Ошибка обработки Telegram-сообщения', error);
      }
    });

    this.logger.log('Telegram diary handler запущен');
  }
}

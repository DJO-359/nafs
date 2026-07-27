import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import TelegramBot from 'node-telegram-bot-api';

import { TelegramService } from './telegram.service';
import { Reminder } from '../reminders/models/reminder.model';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class TelegramUpdateService {
  private readonly logger = new Logger(TelegramUpdateService.name);

  constructor(
    private readonly telegramService: TelegramService,

    @Inject(forwardRef(() => RemindersService))
    private readonly remindersService: RemindersService,

    @InjectModel(Reminder)
    private readonly reminderModel: typeof Reminder,
  ) {
    const bot = this.telegramService.getBot();

    bot.on('callback_query', async (query) => {
      try {
        const data = query.data;

        if (!data) return;

        const [action, reminderId] = data.split(':');

        const reminder = await this.reminderModel.findByPk(reminderId);

        if (!reminder) return;

        switch (action) {
          case 'done':
            await this.remindersService.completeById(reminderId);

            await bot.answerCallbackQuery(query.id, {
              text: '✅ Выполнено',
            });

            break;

          case 'hour':
            await this.remindersService.postponeHour(reminderId);

            await bot.answerCallbackQuery(query.id, {
              text: '⏰ Через час',
            });

            break;

          case 'tomorrow':
            await this.remindersService.postponeTomorrow(reminderId);

            await bot.answerCallbackQuery(query.id, {
              text: '📅 Завтра',
            });

            break;
        }
      } catch (error) {
        this.logger.error('Ошибка обработки callback_query', error);
      }
    });

    this.logger.log('Telegram callback handler запущен');
  }
}

import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TelegramService } from './telegram.service';
import { TelegramUpdateService } from './telegram-update.service';
import { TelegramHandlerService } from './telegram-handler/telegram-handler.service';

import { Reminder } from '../reminders/models/reminder.model';
import { UsersModule } from '../users/users.module';
import { TelegramStateService } from './telegram-state.service';
import { DiaryModule } from '../diary/diary.module';
import { RemindersModule } from '../reminders/reminders.module'; // импорт RemindersModule

@Module({
  imports: [
    SequelizeModule.forFeature([Reminder]),
    UsersModule,
    DiaryModule,
    forwardRef(() => RemindersModule), // разрешаем циклическую зависимость
  ],

  providers: [
    TelegramService,
    TelegramUpdateService,
    TelegramHandlerService,
    TelegramStateService,
  ],

  exports: [TelegramService],
})
export class TelegramModule {}

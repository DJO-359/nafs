import { Module, forwardRef } from '@nestjs/common';

import { TelegramService } from './telegram.service';
import { TelegramUpdateService } from './telegram-update.service';
import { TelegramHandlerService } from './telegram-handler/telegram-handler.service';
import { TelegramStateService } from './telegram-state.service';

import { UsersModule } from '../users/users.module';
import { DiaryModule } from '../diary/diary.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [UsersModule, DiaryModule, forwardRef(() => RemindersModule)],
  providers: [
    TelegramService,
    TelegramUpdateService,
    TelegramHandlerService,
    TelegramStateService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}

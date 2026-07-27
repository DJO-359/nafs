import { Module } from '@nestjs/common';

import { DayController } from './day.controller';
import { DayService } from './day.service';

import { DiaryModule } from '../diary/diary.module';
import { IntentionModule } from '../intention/intention.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [DiaryModule, IntentionModule, RemindersModule],
  controllers: [DayController],
  providers: [DayService],
})
export class DayModule {}

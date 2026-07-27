import { Module } from '@nestjs/common';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

import { DiaryModule } from '../diary/diary.module';
import { IntentionModule } from '../intention/intention.module';
import { RemindersModule } from '../reminders/reminders.module';

@Module({
  imports: [DiaryModule, IntentionModule, RemindersModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

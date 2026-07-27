import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { TelegramModule } from './telegram/telegram.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { RemindersModule } from './reminders/reminders.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DiaryModule } from './diary/diary.module';
import { IntentionModule } from './intention/intention.module';
import { DayModule } from './day/day.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    UsersModule,
    CalendarModule,
    TelegramModule,
    AuthModule,
    StatsModule,
    RemindersModule,
    DiaryModule,
    IntentionModule,
    DayModule,
  ],
})
export class AppModule {}

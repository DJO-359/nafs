import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { TelegramModule } from './telegram/telegram.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { RemindersModule } from './reminders/reminders.module';
import { DiaryModule } from './diary/diary.module';
import { IntentionModule } from './intention/intention.module';
import { DayModule } from './day/day.module';
import { CalendarModule } from './calendar/calendar.module';
import { HabitsModule } from './habits/habits.module';
import { TasbihModule } from './tasbih/tasbih.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    ScheduleModule.forRoot(),
    HealthModule,
    UsersModule,
    CalendarModule,
    TelegramModule,
    AuthModule,
    StatsModule,
    RemindersModule,
    DiaryModule,
    IntentionModule,
    DayModule,
    HabitsModule,
    TasbihModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

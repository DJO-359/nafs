import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/models/user.model';
import { Intention } from '../intention/models/intention.model';
import { Reminder } from '../reminders/models/reminder.model';
import { DiaryEntry } from '../diary/models/diary-entry.model';
import { Habit } from '../habits/models/habit.model';
import { HabitCompletion } from '../habits/models/habit-completion.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // ---- ВРЕМЕННЫЕ ЛОГИ ДЛЯ ОТЛАДКИ ----
        console.log('DB_SYNC =', configService.get('DB_SYNC'));
        console.log('DB_SSL =', configService.get('DB_SSL'));
        console.log('DB_HOST =', configService.get('DB_HOST'));
        console.log('DB_NAME =', configService.get('DB_NAME'));
        console.log('DB_USER =', configService.get('DB_USER'));
        // -------------------------------------

        return {
          dialect: 'postgres' as const,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USER'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_NAME'),
          dialectOptions: configService.get<boolean>('DB_SSL')
            ? {
                ssl: {
                  require: true,
                  // Сертификат провайдера проверяем — иначе TLS не защищает от MITM
                  rejectUnauthorized: true,
                },
              }
            : {},
          models: [
            User,
            Intention,
            Reminder,
            DiaryEntry,
            Habit,
            HabitCompletion,
          ],
          autoLoadModels: true,
          /**
           * Схема управляется миграциями (npm run db:migrate).
           * DB_SYNC оставлен только для локальной песочницы и по умолчанию выключен:
           * sync() умеет молча терять данные при изменении типа колонки.
           */
          synchronize: configService.get<boolean>('DB_SYNC') === true,
          logging: true, // Принудительно включено для отладки
        };
      },
    }),
  ],
})
export class DatabaseModule {}

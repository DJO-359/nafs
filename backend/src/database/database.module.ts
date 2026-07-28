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
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        models: [User, Intention, Reminder, DiaryEntry, Habit, HabitCompletion],
        autoLoadModels: true,
        // Явное управление через переменную окружения (по умолчанию выключено)
        synchronize: configService.get<string>('DB_SYNC') === 'true',
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}

import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TelegramModule } from '../telegram/telegram.module';
import { UsersModule } from '../users/users.module';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { Reminder } from './models/reminder.model';
import { ReminderSchedulerService } from './reminder-scheduler/reminder-scheduler.service';
import { User } from '../users/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Reminder, User]),
    UsersModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderSchedulerService],
  exports: [RemindersService],
})
export class RemindersModule {}

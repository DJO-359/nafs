import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.logger.log('Scheduler работает');
  }
}

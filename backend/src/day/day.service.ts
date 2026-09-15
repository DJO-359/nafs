import { Injectable, Logger } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class DayService {
  private readonly logger = new Logger(DayService.name);

  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getToday(userId: string, timezone: string) {
    const today = todayInZone(timezone);

    try {
      const [intention, reminders, diary] = await Promise.all([
        this.intentionService.getByDate(userId, today),
        this.remindersService.getUpcomingReminders(userId, timezone),
        this.diaryService.getByDate(userId, today),
      ]);

      return { date: today, intention, reminders, diary };
    } catch (error) {
      this.logger.error(
        '[DayService.getToday] failed',
        this.formatError(error),
      );
      throw error;
    }
  }

  async getByDate(userId: string, timezone: string, date: string) {
    try {
      const [intention, reminders, diary] = await Promise.all([
        this.intentionService.getByDate(userId, date),
        this.remindersService.getByDate(userId, timezone, date),
        this.diaryService.getByDate(userId, date),
      ]);

      return { date, intention, reminders, diary };
    } catch (error) {
      this.logger.error(
        '[DayService.getByDate] failed',
        this.formatError(error),
      );
      throw error;
    }
  }

  private formatError(error: unknown): string {
    const candidate = error as {
      message?: string;
      name?: string;
      original?: { message?: string; code?: string };
      parent?: { message?: string; code?: string };
    };

    return JSON.stringify({
      message: candidate?.message,
      name: candidate?.name,
      originalMessage: candidate?.original?.message,
      parentMessage: candidate?.parent?.message,
      originalCode: candidate?.original?.code,
      parentCode: candidate?.parent?.code,
    });
  }
}

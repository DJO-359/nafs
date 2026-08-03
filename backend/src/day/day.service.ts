import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';
import { todayInZone } from '../common/utils/timezone.util';

@Injectable()
export class DayService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getToday(userId: string, timezone: string) {
    const today = todayInZone(timezone);

    const [intention, reminders, diary] = await Promise.all([
      this.intentionService.getByDate(userId, today),
      this.remindersService.getUpcomingReminders(userId, timezone),
      this.diaryService.getByDate(userId, today),
    ]);

    return { date: today, intention, reminders, diary };
  }

  async getByDate(userId: string, timezone: string, date: string) {
    const [intention, reminders, diary] = await Promise.all([
      this.intentionService.getByDate(userId, date),
      this.remindersService.getByDate(userId, timezone, date),
      this.diaryService.getByDate(userId, date),
    ]);

    return { date, intention, reminders, diary };
  }
}

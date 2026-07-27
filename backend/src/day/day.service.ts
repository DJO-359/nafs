import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class DayService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getToday(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const [intention, reminders, diary] = await Promise.all([
      this.intentionService.getTodayIntention(userId),
      this.remindersService.getUpcomingReminders(userId), // заменили
      this.diaryService.getTodayEntry(userId),
    ]);

    return {
      date: today,
      intention,
      reminders,
      diary,
    };
  }

  // ----- добавленный метод getByDate -----
  async getByDate(userId: string, date: string) {
    const [intention, reminders, diary] = await Promise.all([
      this.intentionService.getByDate(userId, date),
      this.remindersService.getByDate(userId, date),
      this.diaryService.getByDate(userId, date),
    ]);

    return {
      date,
      intention,
      reminders,
      diary,
    };
  }
}

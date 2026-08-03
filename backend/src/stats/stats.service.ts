import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';
import { todayInZone } from '../common/utils/timezone.util';
import { calculateStreak } from './streak.util';

export interface StatsResponse {
  diaryEntries: number;
  intentions: number;
  completedIntentions: number;
  reminders: number;
  completedReminders: number;
  streak: number;
  activeDays: number;
}

@Injectable()
export class StatsService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getStats(userId: string, timezone: string): Promise<StatsResponse> {
    const today = todayInZone(timezone);

    // Счётчики считает БД, а не выгрузка всех строк в память
    const [
      diaryCount,
      intentionStats,
      reminderStats,
      diaryDates,
      intentionDates,
      reminderDates,
    ] = await Promise.all([
      this.diaryService.count(userId),
      this.intentionService.getStats(userId),
      this.remindersService.getStats(userId),
      this.diaryService.getActiveDates(userId, today),
      this.intentionService.getActiveDates(userId, today),
      this.remindersService.getTriggeredDates(userId, timezone),
    ]);

    const activeDays = new Set<string>();

    for (const date of [...diaryDates, ...intentionDates, ...reminderDates]) {
      if (date && date <= today) {
        activeDays.add(date);
      }
    }

    return {
      diaryEntries: diaryCount,
      intentions: intentionStats.total,
      completedIntentions: intentionStats.completed,
      reminders: reminderStats.total,
      completedReminders: reminderStats.completed,
      streak: calculateStreak(activeDays, today),
      activeDays: activeDays.size,
    };
  }
}

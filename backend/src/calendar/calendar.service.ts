import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';
import {
  daysInMonth,
  formatDayInZone,
  monthRangeInZone,
} from '../common/utils/timezone.util';

export type DayStatus = 'empty' | 'partial' | 'success';

@Injectable()
export class CalendarService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  /**
   * Данные календаря за один месяц.
   *
   * Раньше метод трижды звал getAll(userId) — то есть выгружал всю историю
   * пользователя за все годы ради одного месяца — и фильтровал её в JS
   * внутри цикла по дням. Теперь из БД приходит только нужный период.
   */
  async getMonth(
    userId: string,
    timezone: string,
    year: number,
    month: number,
  ) {
    const total = daysInMonth(year, month);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-${String(total).padStart(2, '0')}`;
    const range = monthRangeInZone(year, month, timezone);

    const [intentions, diaryEntries, reminders] = await Promise.all([
      this.intentionService.getBetween(userId, from, to),
      this.diaryService.getBetween(userId, from, to),
      this.remindersService.getBetween(userId, range.start, range.end),
    ]);

    const diaryDates = new Set(diaryEntries.map((entry) => entry.date));
    const pinEmojisByDate = new Map<string, string>();

    for (const entry of diaryEntries) {
      if (!entry.isPinned || !entry.pinEmoji) continue;

      pinEmojisByDate.set(entry.date, entry.pinEmoji);
    }
    const intentionByDate = new Map(
      intentions.map((intention) => [intention.date, intention]),
    );

    const remindersByDate = new Map<
      string,
      { total: number; completed: number }
    >();

    for (const reminder of reminders) {
      // День напоминания считается в зоне пользователя, а не в UTC
      const key = formatDayInZone(new Date(reminder.remindAt), timezone);
      const bucket = remindersByDate.get(key) ?? { total: 0, completed: 0 };

      bucket.total += 1;
      if (reminder.completed) bucket.completed += 1;

      remindersByDate.set(key, bucket);
    }

    const days: { date: string; status: DayStatus; pinEmojis: string[] }[] = [];

    for (let day = 1; day <= total; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      let score = 0;

      if (diaryDates.has(date)) score += 1;

      const intention = intentionByDate.get(date);
      if (intention) score += 1;
      if (intention?.completed) score += 1;

      const reminderStats = remindersByDate.get(date);
      if (reminderStats && reminderStats.total > 0) {
        score += 1;
        if (reminderStats.completed === reminderStats.total) score += 1;
      }

      const pinnedEmoji = pinEmojisByDate.get(date);

      days.push({
        date,
        status: CalendarService.toStatus(score),
        pinEmojis: pinnedEmoji ? [pinnedEmoji] : [],
      });
    }

    return {
      year,
      month,
      counts: {
        intentions: intentions.length,
        diaryEntries: diaryEntries.length,
        reminders: reminders.length,
      },
      days,
    };
  }

  private static toStatus(score: number): DayStatus {
    if (score >= 4) return 'success';
    if (score >= 1) return 'partial';
    return 'empty';
  }
}

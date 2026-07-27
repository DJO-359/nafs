import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getStats(userId: string) {
    const diaryEntries = await this.diaryService.getAll(userId);
    const intentions = await this.intentionService.getAll(userId);
    const reminders = await this.remindersService.getAll(userId);

    // Множество для уникальных дат активности
    const activeDays = new Set<string>();

    // Добавляем даты из дневника
    for (const diary of diaryEntries) {
      activeDays.add(diary.createdAt.toISOString().slice(0, 10));
    }

    // Добавляем даты из намерений
    for (const intention of intentions) {
      activeDays.add(intention.date);
    }

    // Добавляем даты из напоминаний
    for (const reminder of reminders) {
      activeDays.add(reminder.remindAt.toISOString().slice(0, 10));
    }

    // ------ вычисление серии (streak) ------
    const sortedDays = [...activeDays].sort().reverse();

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const day of sortedDays) {
      const date = new Date(day);
      date.setHours(0, 0, 0, 0);

      const diff =
        (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diff === 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    // -------------------------------------

    return {
      diaryEntries: diaryEntries.length,
      intentions: intentions.length,
      completedIntentions: intentions.filter((i) => i.completed).length,
      reminders: reminders.length,
      completedReminders: reminders.filter((r) => r.completed).length,
      streak, // ← теперь реальное значение
      activeDays: activeDays.size,
    };
  }
}

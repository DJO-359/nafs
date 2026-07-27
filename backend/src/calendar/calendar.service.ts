import { Injectable } from '@nestjs/common';

import { DiaryService } from '../diary/diary.service';
import { IntentionService } from '../intention/intention.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly intentionService: IntentionService,
    private readonly remindersService: RemindersService,
  ) {}

  async getMonth(userId: string, year: number, month: number) {
    const intentions = await this.intentionService.getAll(userId);
    const diaryEntries = await this.diaryService.getAll(userId);
    const reminders = await this.remindersService.getAll(userId);

    const daysInMonth = new Date(year, month, 0).getDate();

    const days: { date: string; status: string }[] = [];

    // Шаг 1: функция для определения статуса по количеству очков
    function getScoreStatus(score: number) {
      if (score >= 4) return 'success';
      if (score >= 1) return 'partial';
      return 'empty';
    }

    // Шаг 2: новый цикл с подсчётом очков
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      let score = 0;

      // Дневник
      const hasDiary = diaryEntries.some((entry) =>
        entry.createdAt.toISOString().startsWith(date),
      );
      if (hasDiary) score++;

      // Намерение
      const intention = intentions.find((item) => item.date === date);
      if (intention) score++;
      if (intention?.completed) score++;

      // Напоминания
      const remindersOfDay = reminders.filter((item) =>
        item.remindAt.toISOString().startsWith(date),
      );
      if (remindersOfDay.length > 0) score++;
      if (
        remindersOfDay.length > 0 &&
        remindersOfDay.every((item) => item.completed)
      ) {
        score++;
      }

      days.push({
        date,
        status: getScoreStatus(score),
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
}

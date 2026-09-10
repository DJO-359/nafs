import type { Habit } from "../api/habit.api";

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getHabitMissedDayIndexes(habit: Habit): number[] {
  const todayKey = toDateKey(new Date());
  const yesterday = toUtcDate(todayKey);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const periodEnd =
    habit.endDate < toDateKey(yesterday) ? habit.endDate : toDateKey(yesterday);
  if (habit.startDate > periodEnd) return [];

  const completedDates = new Set(
    habit.completions.map((completion) => completion.completedDate),
  );
  const currentDate = toUtcDate(habit.startDate);
  const endDate = toUtcDate(periodEnd);
  const missedDayIndexes: number[] = [];
  let dayIndex = 0;

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().slice(0, 10);
    if (!completedDates.has(dateKey)) {
      missedDayIndexes.push(dayIndex);
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    dayIndex += 1;
  }

  return missedDayIndexes;
}

export function getHabitConsecutiveMissedDays(habit: Habit): number {
  const yesterday = toUtcDate(toDateKey(new Date()));
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (habit.endDate < yesterday.toISOString().slice(0, 10)) return 0;

  const completedDates = new Set(
    habit.completions.map((completion) => completion.completedDate),
  );
  let consecutiveMissedDays = 0;
  let currentDate = yesterday;

  while (currentDate.toISOString().slice(0, 10) >= habit.startDate) {
    const dateKey = currentDate.toISOString().slice(0, 10);
    if (dateKey > habit.endDate || completedDates.has(dateKey)) break;

    consecutiveMissedDays += 1;
    currentDate = new Date(currentDate);
    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
  }

  return consecutiveMissedDays;
}

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

const MISS_LIMIT_POINTS = [
  { days: 30, limit: 2 },
  { days: 60, limit: 5 },
  { days: 90, limit: 8 },
  { days: 180, limit: 15 },
  { days: 365, limit: 30 },
];

function getHabitTotalDays(habit: Habit): number {
  const start = toUtcDate(habit.startDate);
  const end = toUtcDate(habit.endDate);
  return Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
}

export function getHabitMissLimit(habit: Habit): number {
  const totalDays = getHabitTotalDays(habit);

  if (totalDays <= MISS_LIMIT_POINTS[0].days) {
    return MISS_LIMIT_POINTS[0].limit;
  }

  if (totalDays >= MISS_LIMIT_POINTS[4].days) {
    return MISS_LIMIT_POINTS[4].limit;
  }

  for (let index = 1; index < MISS_LIMIT_POINTS.length; index += 1) {
    const previous = MISS_LIMIT_POINTS[index - 1];
    const current = MISS_LIMIT_POINTS[index];
    if (totalDays <= current.days) {
      const ratio =
        (totalDays - previous.days) / (current.days - previous.days);
      return Math.round(
        previous.limit + ratio * (current.limit - previous.limit),
      );
    }
  }

  return MISS_LIMIT_POINTS[4].limit;
}

function getAllHabitMissedDayIndexes(habit: Habit): number[] {
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

export function getHabitMissedDayIndexes(habit: Habit): number[] {
  return getAllHabitMissedDayIndexes(habit);
}

export function getHabitDisplayedMissedDayIndexes(
  habit: Habit,
  isSuspended = habit.isSuspended,
): number[] {
  const missedIndexes = getHabitMissedDayIndexes(habit);
  return isSuspended
    ? missedIndexes.slice(0, getHabitMissLimit(habit))
    : missedIndexes;
}

export function getHabitMissedDayCount(habit: Habit): number {
  return getAllHabitMissedDayIndexes(habit).length;
}

export function shouldSuspendHabit(habit: Habit): boolean {
  return getHabitMissedDayCount(habit) > getHabitMissLimit(habit);
}

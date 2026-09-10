import { useEffect, useState } from "react";
import type { Habit } from "../api/habit.api";
import {
  getHabitConsecutiveMissedDays,
  toDateKey,
} from "../lib/habit-progress";

const STORAGE_PREFIX = "habit-suspended-";

function getStorageKey(habitId: string) {
  return `${STORAGE_PREFIX}${habitId}`;
}

function hasCompletionAfter(habit: Habit, dateKey: string) {
  return habit.completions.some(
    (completion) => completion.completedDate > dateKey,
  );
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function useHabitSuspensions(habits: Habit[]) {
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expiredHabitIds, setExpiredHabitIds] = useState<string[]>([]);

  useEffect(() => {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 100);
    const timer = window.setTimeout(
      () => setTodayKey(toDateKey(new Date())),
      nextDay.getTime() - now.getTime(),
    );

    return () => window.clearTimeout(timer);
  }, [todayKey]);

  useEffect(() => {
    const nextSuspendedIds = new Set<string>();
    const nextExpiredHabitIds: string[] = [];

    habits.forEach((habit) => {
      const storageKey = getStorageKey(habit.id);
      const storedDate = localStorage.getItem(storageKey);
      const hasThreeMissedDays = getHabitConsecutiveMissedDays(habit) >= 3;
      const canStartNewSuspension =
        !storedDate || hasCompletionAfter(habit, storedDate);

      if (hasThreeMissedDays && canStartNewSuspension) {
        localStorage.setItem(storageKey, todayKey);
        nextSuspendedIds.add(habit.id);
      } else if (storedDate === todayKey) {
        nextSuspendedIds.add(habit.id);
      }

      if (storedDate) {
        const recoveryDate = addDays(storedDate, 1);
        const missedRecoveryDay = !habit.completions.some(
          (completion) => completion.completedDate === recoveryDate,
        );

        if (todayKey > recoveryDate && missedRecoveryDay) {
          nextExpiredHabitIds.push(habit.id);
        }
      }
    });

    setSuspendedIds(nextSuspendedIds);
    setExpiredHabitIds(nextExpiredHabitIds);
  }, [habits, todayKey]);

  return { suspendedIds, expiredHabitIds };
}

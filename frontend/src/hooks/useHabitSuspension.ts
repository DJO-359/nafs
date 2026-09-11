import { useEffect, useState } from "react";
import type { Habit } from "../api/habit.api";
import {
  getHabitConsecutiveMissedDays,
  getHabitMissedDayIndexes,
  toDateKey,
} from "../lib/habit-progress";

const STORAGE_PREFIX = "habit-suspended-";
const REACTIVATED_PREFIX = "habit-reactivated-";

function getStorageKey(habitId: string) {
  return `${STORAGE_PREFIX}${habitId}`;
}

function getReactivatedStorageKey(habitId: string) {
  return `${REACTIVATED_PREFIX}${habitId}`;
}

function toUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateFromMissedIndex(habit: Habit, index: number): string {
  const start = toUtcDate(habit.startDate);
  start.setUTCDate(start.getUTCDate() + index);
  return start.toISOString().slice(0, 10);
}

export function useHabitSuspensions(habits: Habit[]) {
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expiredHabitIds, setExpiredHabitIds] = useState<string[]>([]);

  function clearSuspension(habitId: string) {
    localStorage.removeItem(getStorageKey(habitId));
    localStorage.setItem(getReactivatedStorageKey(habitId), todayKey);
    setSuspendedIds((prev) => {
      const next = new Set(prev);
      next.delete(habitId);
      return next;
    });
  }

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
      const reactivatedDate = localStorage.getItem(
        getReactivatedStorageKey(habit.id),
      );
      const missedIndexes = getHabitMissedDayIndexes(habit);

      if (reactivatedDate) {
        const hasMissedAfterReactivate = missedIndexes.some((index) => {
          return dateFromMissedIndex(habit, index) >= reactivatedDate;
        });

        if (hasMissedAfterReactivate) {
          nextExpiredHabitIds.push(habit.id);
        }

        return;
      }

      if (storedDate) {
        nextSuspendedIds.add(habit.id);
        return;
      }

      if (getHabitConsecutiveMissedDays(habit) >= 3) {
        localStorage.setItem(storageKey, todayKey);
        nextSuspendedIds.add(habit.id);
      }
    });

    setSuspendedIds(nextSuspendedIds);
    setExpiredHabitIds(Array.from(new Set(nextExpiredHabitIds)));
  }, [habits, todayKey]);

  return { suspendedIds, expiredHabitIds, clearSuspension };
}

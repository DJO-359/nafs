import { useEffect, useMemo, useState } from "react";

export type DayPlanScheduleType = "today" | "tomorrow" | "date" | "weekly";

export interface DayPlanSchedule {
  scheduleType: DayPlanScheduleType;
  scheduledDate?: string;
  repeatDays?: number[];
}

export interface DayPlanTask extends DayPlanSchedule {
  id: string;
  title: string;
  completed: boolean;
  completedDates?: string[];
}

const STORAGE_KEY = "nafs-day-plan";
const LEGACY_PREFIX = "nafs-day-plan:";

function getLocalDateString(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return getLocalDateString(value);
}

function normalizeTask(
  task: Partial<DayPlanTask>,
  fallbackDate?: string,
): DayPlanTask | null {
  if (
    typeof task.id !== "string" ||
    typeof task.title !== "string" ||
    !task.title.trim()
  ) {
    return null;
  }

  const scheduleType =
    task.scheduleType === "tomorrow" ||
    task.scheduleType === "date" ||
    task.scheduleType === "weekly"
      ? task.scheduleType
      : "today";

  return {
    id: task.id,
    title: task.title,
    completed: Boolean(task.completed),
    completedDates: Array.isArray(task.completedDates)
      ? task.completedDates.filter(
          (date): date is string => typeof date === "string",
        )
      : undefined,
    scheduleType,
    scheduledDate:
      scheduleType === "date" && typeof task.scheduledDate === "string"
        ? task.scheduledDate
        : scheduleType === "today"
          ? fallbackDate
          : scheduleType === "tomorrow" && fallbackDate
            ? addDays(fallbackDate, 1)
            : undefined,
    repeatDays:
      scheduleType === "weekly" && Array.isArray(task.repeatDays)
        ? task.repeatDays.filter(
            (day): day is number =>
              Number.isInteger(day) && day >= 0 && day <= 6,
          )
        : undefined,
  };
}

function readTasks(): DayPlanTask[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed
          .map((task) => normalizeTask(task as Partial<DayPlanTask>))
          .filter((task): task is DayPlanTask => task !== null);
      }
    }

    const migrated: DayPlanTask[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(LEGACY_PREFIX)) continue;
      const date = key.slice(LEGACY_PREFIX.length);
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (!Array.isArray(parsed)) continue;
      for (const task of parsed) {
        const normalized = normalizeTask(task as Partial<DayPlanTask>, date);
        if (normalized) migrated.push(normalized);
      }
    }
    return migrated;
  } catch {
    return [];
  }
}

export function isDayPlanTaskVisibleForDate(
  task: DayPlanTask,
  date: string,
  today = getLocalDateString(),
) {
  switch (task.scheduleType) {
    case "tomorrow":
      return date === addDays(today, 1);
    case "date":
      return task.scheduledDate === date;
    case "weekly": {
      if (!task.repeatDays?.length) return false;
      const weekday = new Date(`${date}T12:00:00`).getDay();
      return task.repeatDays.includes(weekday);
    }
    case "today":
    default:
      return date === today;
  }
}

function taskForDate(task: DayPlanTask, date: string): DayPlanTask {
  const completed =
    task.completedDates?.includes(date) ??
    (task.completed && task.scheduleType !== "weekly");
  return { ...task, completed };
}

export function useDayPlan(date: string) {
  const [allTasks, setAllTasks] = useState<DayPlanTask[]>(() => readTasks());

  useEffect(() => {
    setAllTasks(readTasks());
  }, [date]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
  }, [allTasks]);

  const tasks = useMemo(
    () =>
      allTasks
        .filter((task) => isDayPlanTaskVisibleForDate(task, date))
        .map((task) => taskForDate(task, date)),
    [allTasks, date],
  );

  function toggleTask(id: string) {
    setAllTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        const completedDates = new Set(task.completedDates ?? []);
        if (completedDates.has(date)) completedDates.delete(date);
        else completedDates.add(date);
        return {
          ...task,
          completed: !task.completed,
          completedDates: [...completedDates],
        };
      }),
    );
  }

  function addTask(title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setAllTasks((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        title: trimmedTitle,
        completed: false,
        scheduleType: "today",
        scheduledDate: date,
      },
    ]);
  }

  function removeTask(id: string) {
    setAllTasks((current) => current.filter((task) => task.id !== id));
  }

  function updateTaskSchedule(id: string, schedule: DayPlanSchedule) {
    setAllTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...schedule } : task)),
    );
  }

  return { tasks, addTask, removeTask, toggleTask, updateTaskSchedule };
}

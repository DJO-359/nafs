import { useEffect, useState } from "react";

export interface DayPlanTask {
  id: string;
  title: string;
  completed: boolean;
}

function getStorageKey(date: string) {
  return `nafs-day-plan:${date}`;
}

function readTasks(date: string): DayPlanTask[] {
  if (!date) return [];

  try {
    const stored = localStorage.getItem(getStorageKey(date));
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (task): task is DayPlanTask =>
        typeof task === "object" &&
        task !== null &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean",
    );
  } catch {
    return [];
  }
}

export function useDayPlan(date: string) {
  const [tasks, setTasks] = useState<DayPlanTask[]>(() => readTasks(date));

  useEffect(() => {
    setTasks(readTasks(date));
  }, [date]);

  useEffect(() => {
    if (!date) return;
    localStorage.setItem(getStorageKey(date), JSON.stringify(tasks));
  }, [date, tasks]);

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function addTask(title: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setTasks((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        title: trimmedTitle,
        completed: false,
      },
    ]);
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return { tasks, addTask, removeTask, toggleTask };
}

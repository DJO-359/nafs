import type { Reminder } from "../api/reminder.api";

export interface Intention {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

export interface DiaryEntry {
  id: string;
  userId?: string;
  content: string;
  date: string;
  color: string;
  isPinned?: boolean;
  pinEmoji?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderGroup {
  date: string;
  items: Reminder[];
}

export interface GroupedReminders {
  today: Reminder[];
  tomorrow: Reminder[];
  upcoming: ReminderGroup[];
}

/** Ответ GET /day — экран сегодняшнего дня. */
export interface Day {
  date: string;
  intention: Intention | null;
  reminders: GroupedReminders;
  diary: DiaryEntry[];
}

/** Ответ GET /day/:date — конкретный день в истории. */
export interface DayByDate {
  date: string;
  intention: Intention | null;
  reminders: Reminder[];
  diary: DiaryEntry[];
}

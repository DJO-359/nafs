export interface Intention {
  id: string;
  userId: string;
  text: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  remindAt: string;
  completed: boolean;
}

export interface DiaryEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Day {
  date: string;
  intention: Intention | null;
  reminders: Reminder[];
  diary: DiaryEntry | null;
}

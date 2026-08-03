import { api } from "./axios";

export type ReminderRepeatType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "interval"
  | "custom";

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  remindAt: string;
  repeatType: ReminderRepeatType;
  repeatInterval: number;
  repeatDays: number[] | null;
  completed: boolean;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  remindAt: string;
  repeatType?: ReminderRepeatType;
  repeatInterval?: number;
  repeatDays?: number[];
}

/** Все поля необязательны, включая настройки повтора. */
export type UpdateReminderDto = Partial<CreateReminderDto>;

export async function createReminder(dto: CreateReminderDto) {
  const { data } = await api.post<Reminder>("/reminders", dto);
  return data;
}

export async function completeReminder(id: string) {
  const { data } = await api.patch<Reminder>(`/reminders/${id}/complete`);
  return data;
}

export async function deleteReminder(id: string) {
  const { data } = await api.delete<{ deleted: boolean }>(`/reminders/${id}`);
  return data;
}

export async function updateReminder(id: string, dto: UpdateReminderDto) {
  const { data } = await api.patch<Reminder>(`/reminders/${id}`, dto);
  return data;
}

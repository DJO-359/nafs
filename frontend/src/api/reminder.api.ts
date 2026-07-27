// frontend/src/api/reminder.api.ts

import { api } from "./axios";

export type ReminderRepeatType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "interval"
  | "custom";

export interface CreateReminderDto {
  title: string;
  description?: string;
  remindAt: string;
  repeatType?: ReminderRepeatType;
  repeatInterval?: number;
  repeatDays?: number[];
}

export async function createReminder(dto: CreateReminderDto) {
  const { data } = await api.post("/reminders", dto);
  return data;
}

export async function completeReminder(id: string) {
  const { data } = await api.patch(`/reminders/${id}/complete`);
  return data;
}

export async function deleteReminder(id: string) {
  const { data } = await api.delete(`/reminders/${id}`);
  return data;
}

export interface UpdateReminderDto {
  title: string;
  remindAt: string;
}

export async function updateReminder(id: string, dto: UpdateReminderDto) {
  const { data } = await api.patch(`/reminders/${id}`, dto);
  return data;
}

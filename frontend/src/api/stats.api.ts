import { api } from "./axios";

export interface StatsResponse {
  diaryEntries: number;
  intentions: number;
  completedIntentions: number;
  reminders: number;
  completedReminders: number;
  streak: number;
  activeDays: number;
}

export async function getStats() {
  const { data } = await api.get<StatsResponse>("/stats");
  return data;
}

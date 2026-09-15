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

export async function getStats(signal?: AbortSignal) {
  const { data } = await api.get<StatsResponse>("/stats", { signal });
  return data;
}

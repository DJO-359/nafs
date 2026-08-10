import { api } from "./axios";
import type { DiaryEntry } from "../types/day";

export interface UpdateDiaryPayload {
  content: string;
  color?: string;
  isPinned?: boolean;
  pinEmoji?: string | null;
}

export async function saveDiary(
  text: string,
  color?: string,
): Promise<DiaryEntry> {
  const { data } = await api.post<DiaryEntry>("/diary", {
    content: text,
    color,
  });
  return data;
}

export async function updateDiary(
  id: string,
  payload: UpdateDiaryPayload,
): Promise<DiaryEntry> {
  const { data } = await api.patch<DiaryEntry>(`/diary/${id}`, payload);
  return data;
}

export async function getDiaryHistory(): Promise<DiaryEntry[]> {
  const { data } = await api.get<DiaryEntry[]>("/diary/history");
  return data;
}

export async function deleteDiary(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete<{ deleted: boolean }>(`/diary/${id}`);
  return data;
}

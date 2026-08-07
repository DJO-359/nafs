import { api } from "./axios";
import type { DiaryEntry } from "../types/day";

export async function saveDiary(text: string): Promise<DiaryEntry> {
  const { data } = await api.post<DiaryEntry>("/diary", { content: text });
  return data;
}

export async function updateDiary(
  id: string,
  text: string,
): Promise<DiaryEntry> {
  const { data } = await api.patch<DiaryEntry>(`/diary/${id}`, {
    content: text,
  });
  return data;
}

export async function getDiaryHistory(): Promise<DiaryEntry[]> {
  const { data } = await api.get<DiaryEntry[]>("/diary/history");
  return data;
}

import { api } from "./axios";
import type { DayByDate } from "../types/day";

export async function getDayByDate(
  date: string,
  signal?: AbortSignal,
): Promise<DayByDate> {
  const response = await api.get<DayByDate>(`/day/${date}`, { signal });
  return response.data;
}

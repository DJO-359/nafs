import { api } from "./axios";
import type { DayByDate } from "../types/day";

export async function getDayByDate(date: string): Promise<DayByDate> {
  const { data } = await api.get<DayByDate>(`/day/${date}`);
  return data;
}

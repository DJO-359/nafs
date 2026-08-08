import { api } from "./axios";
import type { DayByDate } from "../types/day";

export async function getDayByDate(date: string): Promise<DayByDate> {
  const response = await api.get<DayByDate>(`/day/${date}`);
  console.log("[getDayByDate] response.data:", response.data);
  return response.data;
}

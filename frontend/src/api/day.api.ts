import { api } from "./axios";
import type { Day } from "../types/day";

export async function getDay(signal?: AbortSignal): Promise<Day> {
  const { data } = await api.get<Day>("/day", { signal });
  return data;
}

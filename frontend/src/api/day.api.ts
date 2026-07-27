import { api } from "./axios";
import type { Day } from "../types/day";

export async function getDay(): Promise<Day> {
  const { data } = await api.get<Day>("/day");
  return data;
}

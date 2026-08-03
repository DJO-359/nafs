import { api } from "./axios";
import type { Intention } from "../types/day";

export async function createIntention(text: string): Promise<Intention> {
  const { data } = await api.post<Intention>("/intention", { text });
  return data;
}

export async function completeIntention(): Promise<Intention> {
  const { data } = await api.patch<Intention>("/intention/complete");
  return data;
}

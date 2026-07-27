import { api } from "./axios";

export async function getDayByDate(date: string) {
  const { data } = await api.get(`/day/${date}`);
  return data;
}

import { api } from "./axios";

export interface CalendarDay {
  date: string;
  status: "empty" | "partial" | "success";
  pinEmojis?: string[];
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
}

export async function getCalendar(
  year: number,
  month: number,
  signal?: AbortSignal,
) {
  const { data } = await api.get<CalendarResponse>("/calendar", {
    params: {
      year,
      month,
    },
    signal,
  });

  return data;
}

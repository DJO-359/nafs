import { api } from "./axios";

export interface CalendarDay {
  date: string;
  status: "empty" | "partial" | "success";
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
}

export async function getCalendar(year: number, month: number) {
  const { data } = await api.get<CalendarResponse>("/calendar", {
    params: {
      year,
      month,
    },
  });

  return data;
}

import { useQuery } from "@tanstack/react-query";
import { getCalendar } from "../api/calendar.api";

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () => getCalendar(year, month),
  });
}

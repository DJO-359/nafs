import { useQuery } from "@tanstack/react-query";
import { getDayByDate } from "../api/day-history.api";

export function useDayByDate(date: string) {
  return useQuery({
    queryKey: ["day", date],
    queryFn: () => getDayByDate(date),
  });
}

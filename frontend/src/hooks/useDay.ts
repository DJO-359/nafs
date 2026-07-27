import { useQuery } from "@tanstack/react-query";
import { getDay } from "../api/day.api";

export function useDay() {
  return useQuery({
    queryKey: ["day"],
    queryFn: getDay,
  });
}

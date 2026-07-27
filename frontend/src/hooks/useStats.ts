import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/stats.api";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });
}

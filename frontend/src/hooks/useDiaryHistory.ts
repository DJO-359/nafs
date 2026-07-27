import { useQuery } from "@tanstack/react-query";
import { getDiaryHistory } from "../api/diary";

export function useDiaryHistory() {
  return useQuery({
    queryKey: ["diary-history"],
    queryFn: getDiaryHistory,
  });
}

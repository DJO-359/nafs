import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export type DayDataScope =
  | "day"
  | "stats"
  | "calendar"
  | "diary-history"
  | "habits";

const ALL_SCOPES: DayDataScope[] = [
  "day",
  "stats",
  "calendar",
  "diary-history",
  "habits",
];

/**
 * Сбрасывает все представления, которые зависят от данных дня.
 *
 * Раньше мутации инвалидировали только ["day"], поэтому «Статистика»
 * и «Календарь» продолжали показывать устаревшие цифры до перезагрузки.
 */
export function useInvalidateDayData(scopes: DayDataScope[] = ALL_SCOPES) {
  const queryClient = useQueryClient();
  const scopeKey = scopes.join("|");

  return useCallback(() => {
    for (const scope of scopeKey.split("|")) {
      void queryClient.invalidateQueries({ queryKey: [scope] });
    }
  }, [queryClient, scopeKey]);
}

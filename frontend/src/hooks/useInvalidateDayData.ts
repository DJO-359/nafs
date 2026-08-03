import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Сбрасывает все представления, которые зависят от данных дня.
 *
 * Раньше мутации инвалидировали только ["day"], поэтому «Статистика»
 * и «Календарь» продолжали показывать устаревшие цифры до перезагрузки.
 */
export function useInvalidateDayData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    for (const key of [
      ["day"],
      ["stats"],
      ["calendar"],
      ["diary-history"],
      ["habits"],
    ]) {
      void queryClient.invalidateQueries({ queryKey: key });
    }
  }, [queryClient]);
}

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { saveDiary, updateDiary } from "../api/diary";
import type { DiaryEntry } from "../types/day";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

interface DiaryPayload {
  text: string;
  id?: string;
}

export function useDiary() {
  const invalidate = useInvalidateDayData();

  return useMutation<DiaryEntry, unknown, DiaryPayload>({
    mutationFn: async ({ text, id }) => {
      if (id) {
        return updateDiary(id, text);
      }

      return saveDiary(text);
    },
    onSuccess() {
      toast.success("📖 Дневник сохранён");
      haptic("success");
      invalidate();
    },
    // Раньше упавшая мутация молча реджектилась: пользователь думал,
    // что запись сохранена, а текст терялся
    onError(error) {
      toast.error(`Не удалось сохранить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

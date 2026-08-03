import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { saveDiary } from "../api/diary";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useDiary() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: saveDiary,
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

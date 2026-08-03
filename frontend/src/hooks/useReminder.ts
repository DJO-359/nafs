import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createReminder } from "../api/reminder.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useReminder() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: createReminder,
    onSuccess() {
      toast.success("⏰ Напоминание создано");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось создать: ${describeError(error)}`);
      haptic("error");
    },
  });
}

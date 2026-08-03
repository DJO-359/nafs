import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { completeReminder } from "../api/reminder.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useCompleteReminder() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: completeReminder,
    onSuccess() {
      toast.success("✅ Напоминание выполнено");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось отметить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

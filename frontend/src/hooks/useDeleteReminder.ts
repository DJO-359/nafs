import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteReminder } from "../api/reminder.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useDeleteReminder() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: deleteReminder,
    onSuccess() {
      toast.success("🗑 Напоминание удалено");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось удалить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateReminder, type UpdateReminderDto } from "../api/reminder.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useUpdateReminder() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    // Передаём весь DTO целиком: раньше сюда проходили только title и
    // remindAt, поэтому изменить настройки повтора было невозможно
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReminderDto }) =>
      updateReminder(id, dto),
    onSuccess() {
      toast.success("✏️ Напоминание обновлено");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось обновить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

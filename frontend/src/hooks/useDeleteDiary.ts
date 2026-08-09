import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteDiary } from "../api/diary";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useDeleteDiary() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: deleteDiary,
    onSuccess() {
      toast.success("🗑 Запись удалена");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось удалить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

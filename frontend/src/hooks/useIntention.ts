import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { completeIntention, createIntention } from "../api/intention.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useIntention() {
  const invalidate = useInvalidateDayData();

  const createMutation = useMutation({
    mutationFn: createIntention,
    onSuccess() {
      toast.success("🧭 Намерение сохранено");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось сохранить намерение: ${describeError(error)}`);
      haptic("error");
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeIntention,
    onSuccess() {
      toast.success("🎉 Намерение выполнено");
      haptic("success");
      invalidate();
    },
    onError(error) {
      toast.error(`Не удалось отметить: ${describeError(error)}`);
      haptic("error");
    },
  });

  return { createMutation, completeMutation };
}

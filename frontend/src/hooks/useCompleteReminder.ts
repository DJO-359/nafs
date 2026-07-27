import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // импорт
import { completeReminder } from "../api/reminder.api";

export function useCompleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeReminder,

    onSuccess() {
      toast.success("✅ Напоминание выполнено");

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });
}

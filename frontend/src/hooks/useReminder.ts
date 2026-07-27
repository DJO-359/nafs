import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // импорт
import { createReminder } from "../api/reminder.api";

export function useReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReminder,
    onSuccess() {
      toast.success("⏰ Напоминание создано");

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });
}

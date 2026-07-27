import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // импорт
import { deleteReminder } from "../api/reminder.api";

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReminder,

    onSuccess() {
      toast.success("🗑 Напоминание удалено");

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });
}

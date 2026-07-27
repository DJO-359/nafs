import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // ← импорт
import { updateReminder } from "../api/reminder.api";

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
      remindAt,
    }: {
      id: string;
      title: string;
      remindAt: string;
    }) =>
      updateReminder(id, {
        title,
        remindAt,
      }),

    onSuccess() {
      toast.success("✏️ Напоминание обновлено"); // ← уведомление

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });
}

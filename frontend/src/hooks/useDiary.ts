import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // импорт
import { saveDiary } from "../api/diary";

export function useDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDiary,

    onSuccess() {
      toast.success("📖 Дневник сохранён"); // уведомление

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });
}

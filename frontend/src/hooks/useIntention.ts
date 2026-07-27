import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // импорт
import { createIntention, completeIntention } from "../api/intention.api";

export function useIntention() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createIntention,
    onSuccess() {
      toast.success("🧭 Намерение сохранено");

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: completeIntention,
    onSuccess() {
      toast.success("🎉 Намерение выполнено");

      queryClient.invalidateQueries({
        queryKey: ["day"],
      });
    },
  });

  return {
    createMutation,
    completeMutation,
  };
}

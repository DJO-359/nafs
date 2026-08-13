import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getTasbihCounters,
  createTasbihCounter,
  updateTasbihCounter,
  deleteTasbihCounter,
  incrementTasbihCounter,
  resetTasbihCounter,
  type CreateTasbihCounterPayload,
  type UpdateTasbihCounterPayload,
} from "../api/tasbih.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";

const TASBIH_QUERY_KEY = ["tasbih"] as const;

/**
 * Получить все счётчики пользователя.
 */
export function useTasbih() {
  return useQuery({
    queryKey: TASBIH_QUERY_KEY,
    queryFn: getTasbihCounters,
  });
}

/**
 * Создать новый счётчик.
 */
export function useCreateTasbih() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTasbihCounterPayload) =>
      createTasbihCounter(payload),
    onSuccess: () => {
      toast.success("✨ Счётчик создан");
      haptic("success");
      // Инвалидируем список счётчиков, чтобы новый счётчик появился
      void queryClient.invalidateQueries({ queryKey: TASBIH_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Не удалось создать: ${describeError(error)}`);
      haptic("error");
    },
  });
}

/**
 * Обновить счётчик.
 */
export function useUpdateTasbih() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTasbihCounterPayload;
    }) => updateTasbihCounter(id, payload),
    onSuccess: () => {
      haptic("success");
      // Инвалидируем список, чтобы обновленный счётчик отразился
      void queryClient.invalidateQueries({ queryKey: TASBIH_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Не удалось обновить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

/**
 * Удалить счётчик.
 */
export function useDeleteTasbih() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTasbihCounter(id),
    onSuccess: () => {
      toast.success("🗑 Счётчик удалён");
      haptic("success");
      // Инвалидируем список, чтобы удалённый счётчик исчез
      void queryClient.invalidateQueries({ queryKey: TASBIH_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Не удалось удалить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

/**
 * Увеличить count на 1.
 */
export function useIncrementTasbih() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incrementTasbihCounter(id),
    onSuccess: () => {
      haptic("selection");
      // Инвалидируем список, чтобы обновилось значение count
      void queryClient.invalidateQueries({ queryKey: TASBIH_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Не удалось увеличить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

/**
 * Сбросить count в 0.
 */
export function useResetTasbih() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resetTasbihCounter(id),
    onSuccess: () => {
      haptic("success");
      // Инвалидируем список, чтобы обновилось значение count
      void queryClient.invalidateQueries({ queryKey: TASBIH_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Не удалось сбросить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

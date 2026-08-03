import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createHabit,
  deleteHabit,
  getHabits,
  toggleHabit,
  updateHabit,
  type CreateHabitDto,
  type UpdateHabitDto,
} from "../api/habit.api";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import { useInvalidateDayData } from "./useInvalidateDayData";

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: getHabits,
  });
}

export function useCreateHabit() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: (dto: CreateHabitDto) => createHabit(dto),
    onSuccess: () => {
      toast.success("🌱 Привычка создана");
      haptic("success");
      invalidate();
    },
    // Раньше ошибки этих мутаций пропадали молча: пользователь видел
    // закрытую форму и думал, что привычка сохранена
    onError: (error) => {
      toast.error(`Не удалось создать: ${describeError(error)}`);
      haptic("error");
    },
  });
}

export function useUpdateHabit() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHabitDto }) =>
      updateHabit(id, dto),
    onSuccess: () => {
      toast.success("✏️ Привычка обновлена");
      haptic("success");
      invalidate();
    },
    onError: (error) => {
      toast.error(`Не удалось обновить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

export function useDeleteHabit() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      toast.success("🗑 Привычка удалена");
      haptic("success");
      invalidate();
    },
    onError: (error) => {
      toast.error(`Не удалось удалить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

export function useToggleHabit() {
  const invalidate = useInvalidateDayData();

  return useMutation({
    mutationFn: (id: string) => toggleHabit(id),
    onSuccess: () => {
      haptic("selection");
      invalidate();
    },
    onError: (error) => {
      toast.error(`Не удалось отметить: ${describeError(error)}`);
      haptic("error");
    },
  });
}

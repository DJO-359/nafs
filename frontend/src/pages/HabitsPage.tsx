import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import {
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useToggleHabit,
  useUpdateHabit,
} from "../hooks/useHabits";
import HabitForm from "../components/habits/HabitForm";
import type { CreateHabitDto, Habit } from "../api/habit.api";

function formatPeriod(habit: Habit) {
  switch (habit.periodType) {
    case "30_DAYS":
      return "30 дней";
    case "3_MONTHS":
      return "3 месяца";
    case "6_MONTHS":
      return "6 месяцев";
    case "1_YEAR":
      return "1 год";
    case "CUSTOM":
      return `${habit.customPeriodDays ?? 30} дней`;
    default:
      return "Период";
  }
}

export default function HabitsPage() {
  const [open, setOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [celebrationHabit, setCelebrationHabit] = useState<Habit | null>(null);
  const { data: habits = [], isLoading } = useHabits();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const toggleMutation = useToggleHabit();

  const archivedHabits = useMemo(
    () => habits.filter((habit) => habit.isArchived),
    [habits],
  );
  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.isArchived),
    [habits],
  );

  useEffect(() => {
    if (!habits.length) return;

    const justCompletedHabit = habits.find(
      (habit) =>
        habit.isCompleted &&
        !localStorage.getItem(`habit-celebrated-${habit.id}`),
    );

    if (justCompletedHabit) {
      setCelebrationHabit(justCompletedHabit);
      localStorage.setItem(`habit-celebrated-${justCompletedHabit.id}`, "1");
    }
  }, [habits]);

  async function handleSubmit(dto: CreateHabitDto) {
    if (editingHabit) {
      await updateMutation.mutateAsync({ id: editingHabit.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }

    setOpen(false);
    setEditingHabit(null);
  }

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
        >
          ← Назад
        </Link>
        <button
          type="button"
          onClick={() => {
            setEditingHabit(null);
            setOpen((prev) => !prev);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          {open ? "Закрыть" : "Добавить привычку"}
        </button>
      </div>

      <HabitForm
        open={open}
        initialHabit={editingHabit}
        onClose={() => {
          setOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {celebrationHabit && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">🎉 Поздравляем!</p>
          <p className="mt-1">
            Ты успешно завершил привычку «{celebrationHabit.title}».{" "}
            {celebrationHabit.completedDays} из {celebrationHabit.totalDays}{" "}
            дней выполнены.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold">🌱 Все привычки</h1>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="space-y-3">
          {activeHabits.length === 0 && archivedHabits.length === 0 && (
            <Card>
              <p>Пока нет привычек.</p>
            </Card>
          )}

          {activeHabits.map((habit) => (
            <Card key={habit.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <div>
                      <p className="font-semibold">{habit.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatPeriod(habit)}
                      </p>
                    </div>
                  </div>
                  {habit.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {habit.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{habit.progress}%</span>
                      <span>
                        {habit.isCompleted
                          ? "✅ Завершено"
                          : habit.remainingDays > 0
                            ? `Осталось ${habit.remainingDays} дней`
                            : "Завершается сегодня"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, habit.progress)}%`,
                          backgroundColor: habit.isCompleted
                            ? "#10b981"
                            : habit.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>
                      Выполнено {habit.completedDays} / {habit.totalDays}
                    </p>
                    {habit.isCompleted && (
                      <p className="mt-1 text-emerald-700">
                        Период полностью пройден.
                      </p>
                    )}
                  </div>
                </div>
                {habit.isCompleted ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                    ✓
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleMutation.mutate(habit.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${habit.isCompletedToday ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-300"}`}
                  >
                    ✓
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHabit(habit);
                    setOpen(true);
                  }}
                  className="text-emerald-700 hover:underline"
                >
                  ✏️ Изменить
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(habit.id)}
                  className="text-red-600 hover:underline"
                >
                  Удалить
                </button>
              </div>
            </Card>
          ))}

          {archivedHabits.length > 0 && (
            <div>
              <h2 className="mt-4 text-lg font-semibold">Архив</h2>
              {archivedHabits.map((habit) => (
                <Card key={habit.id} className="mt-2">
                  <p className="font-medium">{habit.title}</p>
                  <p className="text-sm text-gray-500">Архивная привычка</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

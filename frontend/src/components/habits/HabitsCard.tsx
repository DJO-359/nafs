import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import {
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useToggleHabit,
  useUpdateHabit,
} from "../../hooks/useHabits";
import HabitForm from "./HabitForm";
import type { CreateHabitDto, Habit } from "../../api/habit.api";

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

export default function HabitsCard() {
  const [open, setOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { data: habits = [], isLoading } = useHabits();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const toggleMutation = useToggleHabit();

  const visibleHabits = useMemo(() => habits.slice(0, 5), [habits]);

  async function handleSubmit(dto: CreateHabitDto) {
    if (editingHabit) {
      await updateMutation.mutateAsync({ id: editingHabit.id, dto });
    } else {
      await createMutation.mutateAsync(dto);
    }

    setOpen(false);
    setEditingHabit(null);
  }

  function openCreate() {
    setEditingHabit(null);
    setOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setOpen(true);
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">🌱 Привычки</h2>
          <p className="text-sm text-gray-500">
            Спокойный прогресс без лишнего
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (open) {
              setOpen(false);
              setEditingHabit(null);
            } else {
              openCreate();
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {open ? "✕" : "+"}
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

      {isLoading ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : (
        <div className="space-y-3">
          {visibleHabits.length === 0 && !open && (
            <p className="text-sm text-gray-500">Пока нет привычек</p>
          )}

          {visibleHabits.map((habit) => (
            <div
              key={habit.id}
              className="rounded-xl border border-gray-200 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <div>
                      <p className="font-medium">{habit.title}</p>
                      <p className="text-xs text-gray-500">
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
                  <div className="mt-2 text-xs text-gray-600">
                    <p>
                      Выполнено {habit.completedDays} / {habit.totalDays}
                    </p>
                    {habit.isCompleted ? (
                      <p className="mt-1 text-emerald-700">
                        Период полностью пройден.
                      </p>
                    ) : null}
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
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${habit.isCompletedToday ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-300"}`}
                    aria-label="Отметить привычку"
                  >
                    ✓
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => openEdit(habit)}
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
            </div>
          ))}

          {habits.length > 5 && (
            <Link
              to="/habits"
              className="block text-center text-sm font-medium text-emerald-700 hover:underline"
            >
              Показать все привычки
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}

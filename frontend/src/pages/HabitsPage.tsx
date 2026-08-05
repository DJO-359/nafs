import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import { useBackButton } from "../hooks/useBackButton";
import {
  useCreateHabit,
  useHabits,
  useToggleHabit,
  useUpdateHabit,
} from "../hooks/useHabits";
import HabitForm from "../components/habits/HabitForm";
import type { CreateHabitDto, Habit } from "../api/habit.api";

const WEEK_DAYS = [
  { label: "ПН", offset: 1 },
  { label: "ВТ", offset: 2 },
  { label: "СР", offset: 3 },
  { label: "ЧТ", offset: 4 },
  { label: "ПТ", offset: 5 },
  { label: "СБ", offset: 6 },
  { label: "ВС", offset: 0 },
];

function formatPeriodLabel(habit: Habit) {
  switch (habit.periodType) {
    case "30_DAYS":
    case "3_MONTHS":
    case "6_MONTHS":
    case "1_YEAR":
      return "Ежедневно";
    case "CUSTOM":
      return "Пользовательский";
    default:
      return "Ежедневно";
  }
}

function getCurrentWeekCompletion(habits: Habit[]) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const completedDays = new Set<string>();

  habits.forEach((habit) => {
    habit.completions.forEach((completion) => {
      const date = new Date(completion.completedDate);
      date.setHours(0, 0, 0, 0);
      if (date >= monday && date <= today) {
        completedDays.add(date.toISOString().slice(0, 10));
      }
    });
  });

  return WEEK_DAYS.map((item) => {
    const dayDate = new Date(monday);
    dayDate.setDate(
      monday.getDate() + (item.offset === 0 ? 6 : item.offset - 1),
    );
    const key = dayDate.toISOString().slice(0, 10);
    return {
      label: item.label,
      completed: completedDays.has(key),
      isToday: dayDate.toDateString() === today.toDateString(),
    };
  });
}

export default function HabitsPage() {
  const [open, setOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { data: habits = [] } = useHabits();

  useBackButton();
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const toggleMutation = useToggleHabit();

  const archivedHabits = useMemo(
    () => habits.filter((habit) => habit.isArchived),
    [habits],
  );
  const activeHabits = useMemo(
    () => habits.filter((habit) => !habit.isArchived),
    [habits],
  );

  const celebrationHabit = useMemo(() => {
    const completed = habits.find(
      (habit) =>
        habit.isCompleted &&
        !localStorage.getItem(`habit-celebrated-${habit.id}`),
    );

    if (completed) {
      localStorage.setItem(`habit-celebrated-${completed.id}`, "1");
    }

    return completed ?? null;
  }, [habits]);

  const weekProgress = useMemo(
    () => getCurrentWeekCompletion(activeHabits),
    [activeHabits],
  );

  const completedHabitsCount = useMemo(
    () => activeHabits.filter((habit) => habit.progress >= 100).length,
    [activeHabits],
  );

  const completeRatio = activeHabits.length
    ? Math.round((completedHabitsCount / activeHabits.length) * 100)
    : 0;

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="rounded-lg border px-4 py-2 transition hover:bg-(--app-bg)"
        >
          ← Назад
        </Link>
        <button
          type="button"
          onClick={() => {
            setEditingHabit(null);
            setOpen((prev) => !prev);
          }}
          className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          +
        </button>
      </div>

      <HabitForm
        key={editingHabit?.id ?? "new"}
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

      <Card className="space-y-4 bg-(--app-surface) p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Привычки</h1>
          </div>
          <div className="rounded-full bg-(--app-bg) px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-(--app-hint)">
              Завершено
            </p>
            <p className="text-lg font-semibold">{completeRatio}%</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-(--app-hint)">
          {weekProgress.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${day.completed ? "bg-emerald-600 text-white" : day.isToday ? "border border-emerald-500 bg-(--app-bg) text-(--app-hint)" : "bg-(--app-surface) text-(--app-hint)"}`}
              >
                {day.completed ? "✓" : day.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {activeHabits.length === 0 ? (
            <div className="rounded-3xl bg-(--app-bg) p-4 text-center text-sm text-(--app-hint)">
              Пока нет привычек.
            </div>
          ) : (
            activeHabits.map((habit) => (
              <button
                type="button"
                key={habit.id}
                onClick={() => {
                  setEditingHabit(habit);
                  setOpen(true);
                }}
                className="group flex w-full items-center gap-3 rounded-3xl bg-(--app-bg) px-3 py-2 text-left transition hover:bg-(--app-surface)"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleMutation.mutate(habit.id);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${habit.isCompletedToday ? "border-emerald-600 bg-emerald-600 text-white" : "border-(--app-border) bg-(--app-bg) text-(--app-hint)"}`}
                >
                  ✓
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">
                      {habit.title}
                    </p>
                    <span className="text-sm font-semibold text-(--app-hint)">
                      {habit.progress}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-(--app-hint)">
                    {habit.description || formatPeriodLabel(habit)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-(--app-border)">
                      <div
                        className="h-1.5 rounded-full bg-emerald-600"
                        style={{ width: `${Math.min(100, habit.progress)}%` }}
                      />
                    </div>
                    <span className="text-xs text-(--app-hint)">
                      {habit.progress}%
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      {archivedHabits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-(--app-hint)">
            Архив
          </h2>
          <div className="space-y-2">
            {archivedHabits.map((habit) => (
              <Card
                key={habit.id}
                className="rounded-3xl border border-(--app-border) p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{habit.title}</p>
                    <p className="mt-1 text-xs text-(--app-hint)">
                      Архивная привычка
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

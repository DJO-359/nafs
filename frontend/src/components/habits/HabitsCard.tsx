import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import Card from "../ui/Card";
import {
  useCreateHabit,
  useHabits,
  useToggleHabit,
  useUpdateHabit,
} from "../../hooks/useHabits";
import HabitForm from "./HabitForm";
import type { CreateHabitDto, Habit } from "../../api/habit.api";

export interface HabitsCardHandle {
  openCreate: () => void;
}

function getProvidedStreak(habit: Habit) {
  const habitWithStreak = habit as Habit & {
    streak?: number;
    currentStreak?: number;
  };

  return habitWithStreak.currentStreak ?? habitWithStreak.streak;
}

const HabitsCard = forwardRef<HabitsCardHandle, object>(
  function HabitsCard(_, ref) {
    const [open, setOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: habits = [], isLoading } = useHabits();

    const createMutation = useCreateHabit();
    const updateMutation = useUpdateHabit();
    const toggleMutation = useToggleHabit();

    const activeHabits = useMemo(
      () => habits.filter((habit) => !habit.isArchived),
      [habits],
    );
    const visibleHabits = useMemo(
      () => (isExpanded ? activeHabits : activeHabits.slice(0, 5)),
      [activeHabits, isExpanded],
    );
    const completedToday = activeHabits.filter(
      (habit) => habit.isCompletedToday,
    ).length;
    const progressPercent = activeHabits.length
      ? Math.round((completedToday / activeHabits.length) * 100)
      : 0;

    async function handleSubmit(dto: CreateHabitDto) {
      if (editingHabit) {
        await updateMutation.mutateAsync({
          id: editingHabit.id,
          dto,
        });
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

    useImperativeHandle(ref, () => ({
      openCreate,
    }));

    function openEdit(habit: Habit) {
      setEditingHabit(habit);
      setOpen(true);
    }

    return (
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl font-medium leading-none text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              aria-label="Создать привычку"
            >
              +
            </button>
            <h2 className="truncate text-lg font-semibold text-(--app-text)">
              Привычки
            </h2>
          </div>
          <span className="shrink-0 text-sm font-semibold text-emerald-600">
            {progressPercent}%
          </span>
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

        {isLoading ? (
          <p className="text-sm text-(--app-hint)">Загрузка...</p>
        ) : (
          <div>
            {visibleHabits.length === 0 && !open && (
              <p className="text-sm text-(--app-hint)">Пока нет привычек</p>
            )}

            <div className="mt-4 divide-y divide-(--app-border)">
              {visibleHabits.map((habit) => (
                <div
                  key={habit.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(habit)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      openEdit(habit);
                    }
                  }}
                  className="group flex w-full cursor-pointer items-center gap-3 py-3 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{
                      backgroundColor: `${habit.color}20`,
                      color: habit.color,
                    }}
                  >
                    {habit.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-(--app-text)">
                        {habit.title}
                      </p>
                      <span className="shrink-0 text-xs text-(--app-hint)">
                        {habit.completedDays}/{habit.totalDays}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-1.5 min-w-0 flex-1 gap-0.5 overflow-hidden rounded-full bg-(--app-border)">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, habit.progress))}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                      {(() => {
                        const streak = getProvidedStreak(habit);
                        return streak === undefined ? null : (
                          <span className="shrink-0 text-xs text-(--app-hint)">
                            🔥 {streak}д
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleMutation.mutate(habit.id);
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm transition active:scale-95"
                    style={
                      habit.isCompletedToday
                        ? {
                            borderColor: habit.color,
                            backgroundColor: habit.color,
                            color: "white",
                          }
                        : {
                            borderColor: "var(--app-border)",
                            backgroundColor: "var(--app-surface)",
                            color: "var(--app-hint)",
                          }
                    }
                    aria-label={
                      habit.isCompletedToday
                        ? "Снять отметку привычки"
                        : "Отметить привычку"
                    }
                  >
                    ✓
                  </button>
                </div>
              ))}
            </div>

            {activeHabits.length > 5 && (
              <button
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                className="mt-3 block text-center text-sm font-medium text-emerald-700 hover:underline"
              >
                {isExpanded ? "Скрыть привычки" : "Показать все привычки"}
              </button>
            )}
          </div>
        )}
      </Card>
    );
  },
);

export default HabitsCard;

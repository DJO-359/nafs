import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Card from "../ui/Card";
import {
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useToggleHabit,
  useUpdateHabit,
} from "../../hooks/useHabits";
import HabitForm from "./HabitForm";
import SuspendedHabitModal from "./SuspendedHabitModal";
import type { CreateHabitDto, Habit } from "../../api/habit.api";
import { getHabitMissedDayIndexes } from "../../lib/habit-progress";
import { useHabitSuspensions } from "../../hooks/useHabitSuspension";

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

interface HabitRowProps {
  habit: Habit;
  isSuspended: boolean;
  onEdit: () => void;
  toggle: () => void;
  onClearSuspension: () => void;
}

function HabitRow({
  habit,
  isSuspended,
  onEdit,
  toggle,
  onClearSuspension,
}: HabitRowProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onEdit();
          }
        }}
        className={`group flex w-full cursor-pointer items-center gap-3 py-3 first:pt-0 last:pb-0 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${isSuspended ? "opacity-75 saturate-50" : ""}`}
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
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="relative flex h-1.5 min-w-0 flex-1 gap-0.5 overflow-hidden rounded-full bg-(--app-border)">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, habit.progress))}%`,
                    backgroundColor: isSuspended
                      ? "var(--app-border)"
                      : habit.color,
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

            <div className="mt-1 flex h-3 items-center gap-1">
              {getHabitMissedDayIndexes(habit).map((dayIndex) => (
                <span
                  key={dayIndex}
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-950/40 motion-safe:animate-[habit-missed-dot_320ms_ease-out]"
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isSuspended) {
              setModalOpen(true);
            } else {
              toggle();
            }
          }}
          className={`flex h-10 shrink-0 items-center justify-center rounded-full border text-sm transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-95 ${isSuspended ? "min-w-26 border-emerald-600 bg-emerald-600 px-3 text-xs font-semibold text-black" : "w-10"}`}
          style={
            !isSuspended && habit.isCompletedToday
              ? {
                  borderColor: habit.color,
                  backgroundColor: habit.color,
                  color: "white",
                }
              : !isSuspended
                ? {
                    borderColor: "var(--app-border)",
                    backgroundColor: "var(--app-surface)",
                    color: "var(--app-hint)",
                  }
                : undefined
          }
          aria-label={isSuspended ? "Активировать привычку" : undefined}
        >
          {isSuspended ? "Активировать" : "✓"}
        </button>
      </div>
      <SuspendedHabitModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          onClearSuspension();
        }}
      />
    </>
  );
}

const DEFAULT_HABITS_LIMIT = 5;

const HabitsCard = forwardRef<HabitsCardHandle, object>(
  function HabitsCard(_, ref) {
    const [open, setOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: habits = [], isLoading } = useHabits();

    const createMutation = useCreateHabit();
    const deleteMutation = useDeleteHabit();
    const updateMutation = useUpdateHabit();
    const toggleMutation = useToggleHabit();

    const activeHabits = useMemo(
      () => habits.filter((habit) => !habit.isArchived),
      [habits],
    );
    const visibleHabits = useMemo(
      () =>
        isExpanded ? activeHabits : activeHabits.slice(0, DEFAULT_HABITS_LIMIT),
      [activeHabits, isExpanded],
    );
    const {
      suspendedIds: suspendedHabitIds,
      expiredHabitIds,
      clearSuspension,
    } = useHabitSuspensions(activeHabits);
    const requestedDeletionIds = useRef(new Set<string>());

    useEffect(() => {
      expiredHabitIds.forEach((habitId) => {
        if (requestedDeletionIds.current.has(habitId)) return;

        requestedDeletionIds.current.add(habitId);
        deleteMutation.mutate(habitId);
      });
    }, [deleteMutation, expiredHabitIds]);
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

            <div className="mt-4 divide-y divide-(--app-border) pb-[120px]">
              {visibleHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  isSuspended={suspendedHabitIds.has(habit.id)}
                  onEdit={() => openEdit(habit)}
                  toggle={() => toggleMutation.mutate(habit.id)}
                  onClearSuspension={() => clearSuspension(habit.id)}
                />
              ))}

              {activeHabits.length > DEFAULT_HABITS_LIMIT && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((expanded) => !expanded)}
                  className="mt-3 block w-full text-center text-sm font-medium text-emerald-700 hover:underline"
                >
                  {isExpanded ? "Скрыть" : "Показать ещё"}
                </button>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  },
);

export default HabitsCard;

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
import ConfirmModal from "../ui/ConfirmModal";
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
  toggle: () => void;
  onClearSuspension: () => void;
  onDelete: () => void;
}

function HabitRow({
  habit,
  isSuspended,
  toggle,
  onClearSuspension,
  onDelete,
}: HabitRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deltaX, setDeltaX] = useState(0);
  const deltaXRef = useRef(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startDeltaX = useRef(0);
  const MAX_SWIPE = 84;

  function applyDelta(nextDelta: number) {
    const clamped = Math.min(0, Math.max(-MAX_SWIPE, nextDelta));
    deltaXRef.current = clamped;
    setDeltaX(clamped);
  }

  function resetSwipe() {
    applyDelta(0);
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center overflow-hidden rounded-r-xl bg-red-500">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-red-500 shadow-sm transition hover:scale-105"
            aria-label="Удалить привычку"
            onClick={(event) => {
              event.stopPropagation();
              setDeleteConfirmOpen(true);
            }}
          >
            🗑️
          </button>
        </div>

        <div
          className={`group flex w-full items-center gap-3 py-3 first:pt-0 last:pb-0 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${isSuspended ? "opacity-75 saturate-50" : ""}`}
          style={{
            transform: `translateX(${deltaX}px)`,
            touchAction: "pan-y",
            backgroundColor: "var(--app-surface)",
          }}
          onPointerDown={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest("button")) return;

            startX.current = event.clientX;
            startY.current = event.clientY;
            startDeltaX.current = deltaXRef.current;
          }}
          onPointerMove={(event) => {
            if (startX.current === null || startY.current === null) return;

            const dx = event.clientX - startX.current;
            const dy = event.clientY - startY.current;

            if (Math.abs(dy) >= Math.abs(dx)) {
              return;
            }

            const next = startDeltaX.current + dx;
            applyDelta(next);
          }}
          onPointerUp={() => {
            if (startDeltaX.current < 0) {
              if (deltaXRef.current >= -MAX_SWIPE / 2) {
                applyDelta(0);
              } else {
                applyDelta(-MAX_SWIPE);
              }
            } else if (deltaXRef.current <= -MAX_SWIPE / 2) {
              applyDelta(-MAX_SWIPE);
            } else {
              resetSwipe();
            }

            startX.current = null;
            startY.current = null;
            startDeltaX.current = 0;
          }}
          onPointerCancel={() => {
            resetSwipe();
            startX.current = null;
            startY.current = null;
            startDeltaX.current = 0;
          }}
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
          }}
          onContinue={() => {
            setModalOpen(false);
            onClearSuspension();
          }}
        />
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Удалить привычку?"
          description="Вы действительно хотите удалить эту привычку?\nЭто действие нельзя отменить."
          confirmText="Удалить"
          onConfirm={() => {
            onDelete();
            setDeleteConfirmOpen(false);
            resetSwipe();
          }}
          onClose={() => {
            setDeleteConfirmOpen(false);
            resetSwipe();
          }}
        />
      </div>
    </>
  );
}

const DEFAULT_HABITS_LIMIT = 5;

const HabitsCard = forwardRef<HabitsCardHandle, object>(
  function HabitsCard(_, ref) {
    const [open, setOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [formResetVersion, setFormResetVersion] = useState(0);

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

    function closeHabitForm() {
      setOpen(false);
      setEditingHabit(null);
      setFormResetVersion((version) => version + 1);
    }

    async function handleSubmit(dto: CreateHabitDto) {
      if (editingHabit) {
        await updateMutation.mutateAsync({
          id: editingHabit.id,
          dto,
        });

        closeHabitForm();
        return;
      }

      await createMutation.mutateAsync(dto);
      closeHabitForm();
    }

    function openCreate() {
      setEditingHabit(null);
      setOpen(true);
    }

    useImperativeHandle(ref, () => ({
      openCreate,
    }));

    return (
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {open && !editingHabit ? (
              <button
                type="button"
                onClick={closeHabitForm}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-border)] text-2xl font-medium leading-none text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-bg)] active:scale-95"
                aria-label="Закрыть форму создания привычки"
              >
                ×
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreate}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl font-medium leading-none text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                aria-label="Создать привычку"
              >
                +
              </button>
            )}
            <h2 className="truncate text-lg font-semibold text-(--app-text)">
              Привычки
            </h2>
          </div>
          <span className="shrink-0 text-sm font-semibold text-emerald-600">
            {progressPercent}%
          </span>
        </div>

        <HabitForm
          key={`${editingHabit?.id ?? "new"}-${formResetVersion}`}
          open={open}
          initialHabit={editingHabit}
          onClose={closeHabitForm}
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
                  toggle={() => toggleMutation.mutate(habit.id)}
                  onClearSuspension={() => clearSuspension(habit.id)}
                  onDelete={() => deleteMutation.mutate(habit.id)}
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

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

// ✅ Новая функция formatPeriod – вычисляет дни из дат
function formatPeriod(habit: Habit) {
  const start = new Date(habit.startDate);
  const end = new Date(habit.endDate);

  const days =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (days === 1) return "1 день";
  if (days >= 2 && days <= 4) return `${days} дня`;
  return `${days} дней`;
}

const HabitsCard = forwardRef<HabitsCardHandle, {}>(
  function HabitsCard(_, ref) {
    const [open, setOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const { data: habits = [], isLoading } = useHabits();

    const createMutation = useCreateHabit();
    const updateMutation = useUpdateHabit();
    const toggleMutation = useToggleHabit();

    const visibleHabits = useMemo(() => habits.slice(0, 5), [habits]);

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
        <div className="mb-6">
          <h2 className="text-lg font-semibold">🌱 Привычки</h2>
          <p className="mt-1 text-sm text-[var(--app-hint)]">
            Спокойный прогресс без лишнего
          </p>
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
          <p className="text-sm text-[var(--app-hint)]">Загрузка...</p>
        ) : (
          <div>
            {visibleHabits.length === 0 && !open && (
              <p className="text-sm text-[var(--app-hint)]">
                Пока нет привычек
              </p>
            )}

            <div className="space-y-[14px]">
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
                  className="group w-full cursor-pointer transform rounded-[22px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition duration-[250ms] ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleMutation.mutate(habit.id);
                      }}
                      className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border transition duration-[250ms] ease-out ${
                        habit.isCompletedToday
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-[var(--app-border)] bg-white text-transparent"
                      }`}
                      aria-label="Отметить привычку"
                    >
                      ✓
                    </button>

                    <div className="min-w-0">
                      <p className="text-[17px] font-semibold text-slate-900">
                        {habit.title}
                      </p>

                      {habit.description ? (
                        <p className="mt-1 text-[14px] text-[#7A7A7A]">
                          {habit.description}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-[var(--app-hint)]">
                        {formatPeriod(habit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {habits.length > 5 && (
              <Link
                to="/habits"
                className="mt-3 block text-center text-sm font-medium text-emerald-700 hover:underline"
              >
                Показать все привычки
              </Link>
            )}
          </div>
        )}
      </Card>
    );
  },
);

export default HabitsCard;

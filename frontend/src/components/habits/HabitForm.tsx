import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import { useDeleteHabit } from "../../hooks/useHabits";
import type { CreateHabitDto, Habit } from "../../api/habit.api";

interface Props {
  open: boolean;
  initialHabit?: Habit | null;
  onClose: () => void;
  onSubmit: (dto: CreateHabitDto) => Promise<void>;
  loading?: boolean;
}

const periodOptions = [
  { value: "30_DAYS", label: "30 дней" },
  { value: "3_MONTHS", label: "3 месяца" },
  { value: "6_MONTHS", label: "6 месяцев" },
  { value: "1_YEAR", label: "1 год" },
  { value: "CUSTOM", label: "Свой период" },
];

const icons = ["📖", "🧘", "🕋", "💧", "🌿", "📚", "🧠", "🏃"];
const colors = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
];

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 1. Исправленная getPeriodDates – для CUSTOM возвращает null
function getPeriodDates(periodType: CreateHabitDto["periodType"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  const end = new Date(today);

  switch (periodType) {
    case "30_DAYS":
      end.setDate(end.getDate() + 30);
      break;
    case "3_MONTHS":
      end.setMonth(end.getMonth() + 3);
      break;
    case "6_MONTHS":
      end.setMonth(end.getMonth() + 6);
      break;
    case "1_YEAR":
      end.setFullYear(end.getFullYear() + 1);
      break;
    case "CUSTOM":
      return null;
  }

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

export default function HabitForm({
  open,
  initialHabit,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const deleteMutation = useDeleteHabit();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Значения по умолчанию для новой привычки — период на 30 дней от сегодня
  const defaultDates = getPeriodDates("30_DAYS") ?? {
    startDate: toInputDate(new Date()),
    endDate: toInputDate(new Date()),
  };

  // Состояние инициализируется из props; сброс делает родитель через key —
  // синхронизация через useEffect вызывала каскадные перерисовки
  const [title, setTitle] = useState(initialHabit?.title ?? "");
  const [description, setDescription] = useState(
    initialHabit?.description ?? "",
  );
  const [icon, setIcon] = useState(initialHabit?.icon ?? "📖");
  const [color, setColor] = useState(initialHabit?.color ?? "#10b981");
  const [periodType, setPeriodType] = useState<CreateHabitDto["periodType"]>(
    initialHabit?.periodType ?? "30_DAYS",
  );
  // Для своего периода пользователь задаёт даты напрямую, отдельного поля
  // ввода нет — значение только передаётся на бэкенд как есть
  const customPeriodDays = initialHabit?.customPeriodDays ?? 30;
  const [startDate, setStartDate] = useState(
    initialHabit?.startDate ?? defaultDates.startDate,
  );
  const [endDate, setEndDate] = useState(
    initialHabit?.endDate ?? defaultDates.endDate,
  );

  const today = toInputDate(new Date());

  // 2. Исправленная applyPeriodDates – не трогает даты при CUSTOM
  function applyPeriodDates(nextPeriodType: CreateHabitDto["periodType"]) {
    setPeriodType(nextPeriodType);

    if (nextPeriodType === "CUSTOM") {
      return;
    }

    const nextDates = getPeriodDates(nextPeriodType);
    if (nextDates) {
      setStartDate(nextDates.startDate);
      setEndDate(nextDates.endDate);
    }
  }

  // 3. Исправленный handleStartDateChange
  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (endDate < value) {
      setEndDate(value);
    }
  }

  // 4. Упрощённая handleEndDateChange – проверка через min в input
  function handleEndDateChange(value: string) {
    setEndDate(value);
  }

  // Поля больше не синхронизируются эффектом: значения заданы при создании
  // компонента, а родитель пересоздаёт форму через key при смене привычки

  async function handleSubmit() {
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      periodType,
      customPeriodDays: periodType === "CUSTOM" ? customPeriodDays : undefined,
      startDate,
      endDate,
    });
  }

  async function handleDelete() {
    if (!initialHabit) return;

    await deleteMutation.mutateAsync(initialHabit.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mt-3 overflow-hidden"
        >
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название привычки"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Описание"
                className="w-full rounded-lg border border-[var(--app-border)] p-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />

              <div>
                <p className="mb-2 text-sm text-[var(--app-hint)]">Иконка</p>
                <div className="flex flex-wrap gap-2">
                  {icons.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      className={`rounded-lg border p-2 text-lg ${icon === item ? "border-emerald-600 bg-emerald-50" : "border-[var(--app-border)] bg-[var(--app-surface)]"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-[var(--app-hint)]">Цвет</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColor(item)}
                      className={`h-8 w-8 rounded-full border-2 ${color === item ? "border-gray-800" : "border-transparent"}`}
                      style={{ backgroundColor: item }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-[var(--app-hint)]">Период</p>
                <div className="space-y-2">
                  {periodOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="period"
                        checked={periodType === option.value}
                        onChange={() =>
                          applyPeriodDates(
                            option.value as CreateHabitDto["periodType"],
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {periodType === "CUSTOM" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-sm text-[var(--app-hint)]">
                      Начало
                    </p>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full rounded-lg border border-[var(--app-border)] p-2"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-[var(--app-hint)]">
                      Окончание
                    </p>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full rounded-lg border border-[var(--app-border)] p-2"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button loading={loading} onClick={handleSubmit}>
                  Сохранить
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-hint)] transition hover:bg-[var(--app-bg)]"
                >
                  Отмена
                </button>
                {initialHabit && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    🗑️ Удалить
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Удалить привычку?"
        description="Привычка будет удалена без возможности восстановления."
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </AnimatePresence>
  );
}

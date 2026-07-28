import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Input from "../ui/Input";
import Button from "../ui/Button";
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

function getPeriodDates(periodType: CreateHabitDto["periodType"]) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);

  switch (periodType) {
    case "30_DAYS":
      endDate.setDate(endDate.getDate() + 30);
      break;
    case "3_MONTHS":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "6_MONTHS":
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case "1_YEAR":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case "CUSTOM":
      endDate.setDate(endDate.getDate() + 30);
      break;
  }

  return {
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
  };
}

export default function HabitForm({
  open,
  initialHabit,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📖");
  const [color, setColor] = useState("#10b981");
  const [periodType, setPeriodType] =
    useState<CreateHabitDto["periodType"]>("30_DAYS");
  const [customPeriodDays, setCustomPeriodDays] = useState(30);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  function applyPeriodDates(nextPeriodType: CreateHabitDto["periodType"]) {
    const nextDates = getPeriodDates(nextPeriodType);
    setPeriodType(nextPeriodType);
    setStartDate(nextDates.startDate);
    setEndDate(nextDates.endDate);
  }

  useEffect(() => {
    if (!open) return;

    if (initialHabit) {
      setTitle(initialHabit.title);
      setDescription(initialHabit.description ?? "");
      setIcon(initialHabit.icon);
      setColor(initialHabit.color);
      setPeriodType(initialHabit.periodType);
      setCustomPeriodDays(initialHabit.customPeriodDays ?? 30);
      setStartDate(initialHabit.startDate);
      setEndDate(initialHabit.endDate);
    } else {
      setTitle("");
      setDescription("");
      setIcon("📖");
      setColor("#10b981");
      setCustomPeriodDays(30);
      applyPeriodDates("30_DAYS");
    }
  }, [open, initialHabit]);

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
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
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
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />

              <div>
                <p className="mb-2 text-sm text-gray-500">Иконка</p>
                <div className="flex flex-wrap gap-2">
                  {icons.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      className={`rounded-lg border p-2 text-lg ${icon === item ? "border-emerald-600 bg-emerald-50" : "border-gray-200 bg-white"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-500">Цвет</p>
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
                <p className="mb-2 text-sm text-gray-500">Период</p>
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
                    <p className="mb-1 text-sm text-gray-500">Начало</p>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Окончание</p>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button loading={loading} onClick={handleSubmit}>
                  Сохранить
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

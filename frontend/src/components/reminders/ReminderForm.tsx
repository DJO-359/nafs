import { useState } from "react";
import { toast } from "sonner";

import Button from "../ui/Button";
import Input from "../ui/Input";
import type {
  CreateReminderDto,
  Reminder,
  ReminderRepeatType,
} from "../../api/reminder.api";

const WEEK_DAYS = [
  { label: "Пн", value: 1 },
  { label: "Вт", value: 2 },
  { label: "Ср", value: 3 },
  { label: "Чт", value: 4 },
  { label: "Пт", value: 5 },
  { label: "Сб", value: 6 },
  { label: "Вс", value: 0 },
];

interface Props {
  /** Напоминание для редактирования; null — создание нового. */
  editing: Reminder | null;
  submitting: boolean;
  onSubmit: (dto: CreateReminderDto) => void;
  onCancel: () => void;
}

function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/** Начальные значения полей: либо из напоминания, либо пустые. */
function initialValues(editing: Reminder | null) {
  if (!editing) {
    return {
      title: "",
      date: todayString(),
      time: "",
      repeatType: "none" as ReminderRepeatType,
      repeatInterval: 1,
      repeatDays: [] as number[],
    };
  }

  const remindAt = new Date(editing.remindAt);
  const month = String(remindAt.getMonth() + 1).padStart(2, "0");
  const day = String(remindAt.getDate()).padStart(2, "0");
  const hours = String(remindAt.getHours()).padStart(2, "0");
  const minutes = String(remindAt.getMinutes()).padStart(2, "0");

  return {
    title: editing.title,
    date: `${remindAt.getFullYear()}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    // Раньше повтор не подставлялся вовсе: селект показывал «Не повторять»
    // даже для ежедневного напоминания, и правка молча его теряла
    repeatType: editing.repeatType ?? ("none" as ReminderRepeatType),
    repeatInterval: editing.repeatInterval ?? 1,
    repeatDays: editing.repeatDays ?? [],
  };
}

/**
 * Форма напоминания. Вынесена из ReminderList, где занимала половину файла.
 *
 * Состояние инициализируется прямо из props, а сброс делает родитель через
 * key — синхронизация через useEffect давала каскадные перерисовки.
 */
export default function ReminderForm({
  editing,
  submitting,
  onSubmit,
  onCancel,
}: Props) {
  const initial = initialValues(editing);

  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [repeatType, setRepeatType] = useState(initial.repeatType);
  const [repeatInterval, setRepeatInterval] = useState(initial.repeatInterval);
  const [repeatDays, setRepeatDays] = useState(initial.repeatDays);

  function handleSubmit() {
    // Раньше пустое поле давало тихий return: пользователь жал кнопку
    // и не понимал, почему ничего не происходит
    if (!title.trim()) {
      toast.error("Введите название напоминания");
      return;
    }

    if (!time) {
      toast.error("Выберите время");
      return;
    }

    if (repeatType === "weekly" && repeatDays.length === 0) {
      toast.error("Выберите хотя бы один день недели");
      return;
    }

    if (repeatType === "interval" && repeatInterval < 1) {
      toast.error("Интервал должен быть больше нуля");
      return;
    }

    onSubmit({
      title: title.trim(),
      remindAt: new Date(`${date}T${time}:00`).toISOString(),
      repeatType,
      repeatInterval: repeatType === "interval" ? repeatInterval : undefined,
      repeatDays: repeatType === "weekly" ? repeatDays : undefined,
    });
  }

  function toggleDay(value: number) {
    setRepeatDays((previous) =>
      previous.includes(value)
        ? previous.filter((day) => day !== value)
        : [...previous, value],
    );
  }

  return (
    <div>
      {editing && (
        <div className="mb-3 rounded-lg bg-blue-50 p-3 text-blue-700">
          ✏️ Редактирование напоминания
        </div>
      )}

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Название"
        className="mb-2"
      />

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="mb-2 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"
      />

      <input
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        className="mb-3 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"
      />

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">Повтор</label>
        <select
          value={repeatType}
          onChange={(event) =>
            setRepeatType(event.target.value as ReminderRepeatType)
          }
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"
        >
          <option value="none">Не повторять</option>
          <option value="daily">Каждый день</option>
          <option value="weekly">Каждую неделю</option>
          <option value="monthly">Каждый месяц</option>
          <option value="interval">Каждые N дней</option>
        </select>
      </div>

      {repeatType === "interval" && (
        <div className="mb-3">
          <label className="mb-1 block text-sm">Интервал (дней)</label>
          <input
            type="number"
            min={1}
            max={365}
            value={repeatInterval}
            onChange={(event) => setRepeatInterval(Number(event.target.value))}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2"
          />
        </div>
      )}

      {repeatType === "weekly" && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Дни недели</label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const selected = repeatDays.includes(day.value);

              return (
                <button
                  type="button"
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`rounded-lg border px-3 py-2 transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-[var(--app-border)] bg-[var(--app-surface)]"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <Button onClick={handleSubmit} loading={submitting}>
          {editing ? "💾 Сохранить" : "Добавить напоминание"}
        </Button>

        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>
      </div>
    </div>
  );
}

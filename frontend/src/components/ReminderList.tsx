// frontend/src/components/ReminderList.tsx

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useCompleteReminder } from "../hooks/useCompleteReminder";
import { useDeleteReminder } from "../hooks/useDeleteReminder";
import { useUpdateReminder } from "../hooks/useUpdateReminder";
import ReminderItem from "./ReminderItem";
import type { CreateReminderDto } from "../api/reminder.api";

interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  completed: boolean;
}

interface ReminderGroup {
  date: string;
  items: Reminder[];
}

interface Props {
  reminders: {
    today: Reminder[];
    tomorrow: Reminder[];
    upcoming: ReminderGroup[];
  };
  onCreate: (dto: CreateReminderDto) => Promise<void>;
}

export default function ReminderList({ reminders, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [repeatType, setRepeatType] = useState("none");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const completeMutation = useCompleteReminder();
  const deleteMutation = useDeleteReminder();
  const updateMutation = useUpdateReminder();

  const weekDays = [
    { label: "Пн", value: 1 },
    { label: "Вт", value: 2 },
    { label: "Ср", value: 3 },
    { label: "Чт", value: 4 },
    { label: "Пт", value: 5 },
    { label: "Сб", value: 6 },
    { label: "Вс", value: 0 },
  ];

  // Шаг 11 – функция описания повторения
  function getRepeatDescription() {
    switch (repeatType) {
      case "daily":
        return "🔁 Напоминание будет повторяться каждый день.";

      case "weekly":
        if (!repeatDays.length) {
          return "📅 Выберите дни недели.";
        }
        return `📅 Выбрано дней: ${repeatDays.length}`;

      case "monthly":
        return "🗓 Повтор каждый месяц.";

      case "interval":
        return `⏱ Повтор каждые ${repeatInterval} дн.`;

      default:
        return "";
    }
  }

  useEffect(() => {
    if (!editingReminder) return;
    setTitle(editingReminder.title);
    const date = editingReminder.remindAt.slice(0, 10);
    const time = editingReminder.remindAt.slice(11, 16);
    setDate(date);
    setTime(time);
    // TODO: загружать repeat поля при редактировании
  }, [editingReminder]);

  async function handleSubmit() {
    if (!title.trim() || !time) return;

    // Шаг 13 – валидация
    if (repeatType === "weekly" && repeatDays.length === 0) {
      alert("Выберите хотя бы один день недели.");
      return;
    }

    if (repeatType === "interval" && repeatInterval < 1) {
      alert("Интервал должен быть больше нуля.");
      return;
    }

    if (editingReminder) {
      updateMutation.mutate({
        id: editingReminder.id,
        title,
        remindAt: `${date}T${time}:00`,
      });
      setEditingReminder(null);
    } else {
      await onCreate({
        title,
        remindAt: `${date}T${time}:00`,
        repeatType: repeatType === "none" ? undefined : repeatType,
        repeatInterval: repeatType === "interval" ? repeatInterval : undefined,
        repeatDays: repeatType === "weekly" ? repeatDays : undefined,
      });
    }

    // Очистка
    setTitle("");
    setTime("");
    setDate(today);
    setRepeatType("none");
    setRepeatInterval(1);
    setRepeatDays([]);
  }

  function split(reminders: Reminder[]) {
    return {
      active: reminders.filter((r) => !r.completed),
      completed: reminders.filter((r) => r.completed),
    };
  }

  const todaySplit = split(reminders.today);
  const tomorrowSplit = split(reminders.tomorrow);
  const upcomingGroups = reminders.upcoming.map((group) => ({
    date: group.date,
    ...split(group.items),
  }));

  const isEditing = editingReminder !== null;

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">⏰ Напоминания</h2>

      {isEditing && (
        <div className="mb-3 rounded-lg bg-blue-50 p-3 text-blue-700">
          ✏️ Редактирование напоминания
        </div>
      )}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className="mb-2"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-2 w-full rounded-lg border p-2"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mb-3 w-full rounded-lg border p-2"
      />

      {/* Блок выбора повторения */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium">Повтор</label>
        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value)}
          className="w-full rounded-lg border p-2"
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
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(Number(e.target.value))}
            className="w-full rounded-lg border p-2"
          />
        </div>
      )}

      {repeatType === "weekly" && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Дни недели</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => {
              const selected = repeatDays.includes(day.value);
              return (
                <button
                  type="button"
                  key={day.value}
                  onClick={() =>
                    setRepeatDays((prev) =>
                      selected
                        ? prev.filter((d) => d !== day.value)
                        : [...prev, day.value],
                    )
                  }
                  className={`rounded-lg border px-3 py-2 transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Шаг 12 – подсказка о выбранном повторении */}
      {repeatType !== "none" && (
        <div className="mb-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {getRepeatDescription()}
        </div>
      )}

      <Button onClick={handleSubmit} className="mb-4">
        {isEditing ? "💾 Сохранить" : "Добавить напоминание"}
      </Button>

      {!reminders.today.length &&
        !reminders.tomorrow.length &&
        !reminders.upcoming.length && (
          <p className="text-gray-500">Пока нет напоминаний</p>
        )}

      {/* Сегодня */}
      {(todaySplit.active.length > 0 || todaySplit.completed.length > 0) && (
        <>
          <h3 className="mb-2 font-semibold">📅 Сегодня</h3>
          {todaySplit.active.length > 0 && (
            <ul className="space-y-2">
              <AnimatePresence mode="popLayout">
                {todaySplit.active.map((item) => (
                  <ReminderItem
                    key={item.id}
                    reminder={item}
                    onComplete={() => completeMutation.mutate(item.id)}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onEdit={() => setEditingReminder(item)}
                    completing={
                      completeMutation.isPending &&
                      completeMutation.variables === item.id
                    }
                    deleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === item.id
                    }
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
          {todaySplit.completed.length > 0 && (
            <>
              <h4 className="mt-4 text-sm font-semibold text-gray-500">
                Выполнено ({todaySplit.completed.length})
              </h4>
              <ul className="space-y-2">
                <AnimatePresence>
                  {todaySplit.completed.map((item) => (
                    <ReminderItem
                      key={item.id}
                      reminder={item}
                      onDelete={() => deleteMutation.mutate(item.id)}
                      onEdit={() => setEditingReminder(item)}
                      deleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables === item.id
                      }
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </>
          )}
        </>
      )}

      {/* Завтра */}
      {(tomorrowSplit.active.length > 0 ||
        tomorrowSplit.completed.length > 0) && (
        <>
          <h3 className="mt-6 mb-2 font-semibold">📅 Завтра</h3>
          {tomorrowSplit.active.length > 0 && (
            <ul className="space-y-2">
              <AnimatePresence mode="popLayout">
                {tomorrowSplit.active.map((item) => (
                  <ReminderItem
                    key={item.id}
                    reminder={item}
                    onComplete={() => completeMutation.mutate(item.id)}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onEdit={() => setEditingReminder(item)}
                    completing={
                      completeMutation.isPending &&
                      completeMutation.variables === item.id
                    }
                    deleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === item.id
                    }
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
          {tomorrowSplit.completed.length > 0 && (
            <>
              <h4 className="mt-4 text-sm font-semibold text-gray-500">
                Выполнено ({tomorrowSplit.completed.length})
              </h4>
              <ul className="space-y-2">
                <AnimatePresence>
                  {tomorrowSplit.completed.map((item) => (
                    <ReminderItem
                      key={item.id}
                      reminder={item}
                      onDelete={() => deleteMutation.mutate(item.id)}
                      onEdit={() => setEditingReminder(item)}
                      deleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables === item.id
                      }
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </>
          )}
        </>
      )}

      {/* Будущие дни */}
      {upcomingGroups.map((group) => {
        const hasContent =
          group.active.length > 0 || group.completed.length > 0;
        if (!hasContent) return null;

        const dateObj = new Date(group.date);
        const formattedDate = dateObj.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        });

        return (
          <div key={group.date}>
            <h3 className="mt-6 mb-2 font-semibold">📅 {formattedDate}</h3>
            {group.active.length > 0 && (
              <ul className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.active.map((item) => (
                    <ReminderItem
                      key={item.id}
                      reminder={item}
                      onComplete={() => completeMutation.mutate(item.id)}
                      onDelete={() => deleteMutation.mutate(item.id)}
                      onEdit={() => setEditingReminder(item)}
                      completing={
                        completeMutation.isPending &&
                        completeMutation.variables === item.id
                      }
                      deleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables === item.id
                      }
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
            {group.completed.length > 0 && (
              <>
                <h4 className="mt-4 text-sm font-semibold text-gray-500">
                  Выполнено ({group.completed.length})
                </h4>
                <ul className="space-y-2">
                  <AnimatePresence>
                    {group.completed.map((item) => (
                      <ReminderItem
                        key={item.id}
                        reminder={item}
                        onDelete={() => deleteMutation.mutate(item.id)}
                        onEdit={() => setEditingReminder(item)}
                        deleting={
                          deleteMutation.isPending &&
                          deleteMutation.variables === item.id
                        }
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            )}
          </div>
        );
      })}
    </Card>
  );
}

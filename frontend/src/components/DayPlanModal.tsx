import { useState } from "react";
import { toast } from "sonner";
import type { Reminder } from "../api/reminder.api";
import type { DayPlanTask } from "../hooks/useDayPlan";
import { useReminder } from "../hooks/useReminder";
import { useUpdateReminder } from "../hooks/useUpdateReminder";
import { useDeleteReminder } from "../hooks/useDeleteReminder";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

interface Props {
  open: boolean;
  tasks: DayPlanTask[];
  reminders: Reminder[];
  dayDate: string;
  onClose: () => void;
  onAddTask: (title: string) => void;
  onRemoveTask: (id: string) => void;
  onSave: () => void;
}

export default function DayPlanModal({
  open,
  tasks,
  reminders,
  dayDate,
  onClose,
  onAddTask,
  onRemoveTask,
  onSave,
}: Props) {
  const [newTask, setNewTask] = useState("");
  const [dateMode, setDateMode] = useState("today");
  const [reminderTaskId, setReminderTaskId] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState(dayDate);
  const [reminderTime, setReminderTime] = useState("");
  const createReminderMutation = useReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  const selectedReminder = reminderTaskId
    ? (reminders.find(
        (reminder) => reminder.dayPlanTaskId === reminderTaskId,
      ) ?? null)
    : null;

  function openReminderEditor(task: DayPlanTask, reminder?: Reminder) {
    setReminderTaskId(task.id);

    if (reminder) {
      const remindAt = new Date(reminder.remindAt);
      const month = String(remindAt.getMonth() + 1).padStart(2, "0");
      const day = String(remindAt.getDate()).padStart(2, "0");
      setReminderDate(`${remindAt.getFullYear()}-${month}-${day}`);
      setReminderTime(
        `${String(remindAt.getHours()).padStart(2, "0")}:${String(
          remindAt.getMinutes(),
        ).padStart(2, "0")}`,
      );
      return;
    }

    setReminderDate(dayDate);
    setReminderTime("");
  }

  async function saveReminder() {
    if (!reminderTaskId || !reminderDate || !reminderTime) {
      toast.error("Выберите дату и время");
      return;
    }

    const dto = {
      dayPlanTaskId: reminderTaskId,
      remindAt: new Date(`${reminderDate}T${reminderTime}:00`).toISOString(),
    };

    if (selectedReminder) {
      await updateReminderMutation.mutateAsync({
        id: selectedReminder.id,
        dto,
      });
    } else {
      const task = tasks.find((item) => item.id === reminderTaskId);
      if (!task) return;

      await createReminderMutation.mutateAsync({
        title: task.title,
        ...dto,
      });
    }

    setReminderTaskId(null);
  }

  async function removeReminder(reminder: Reminder) {
    await deleteReminderMutation.mutateAsync(reminder.id);
    setReminderTaskId(null);
  }

  function handleAddTask() {
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask("");
  }

  return (
    <Modal
      open={open}
      title="План на день"
      onClose={onClose}
      headerAction={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-hint)] transition hover:bg-slate-100"
          aria-label="Закрыть план на день"
        >
          ✕
        </button>
      }
      footer={<Button onClick={onSave}>Сохранить</Button>}
    >
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-[var(--app-hint)]">
          Добавьте задачи, которые хотите сделать сегодня или в ближайшие дни.
        </p>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="space-y-2">
              <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4">
                <span
                  className={`min-w-0 flex-1 text-sm ${
                    task.completed ? "text-[var(--app-hint)] line-through" : ""
                  }`}
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveTask(task.id)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-[var(--app-hint)] transition hover:bg-white hover:text-red-600"
                  aria-label={`Удалить задачу «${task.title}»`}
                >
                  ×
                </button>
              </div>

              {(() => {
                const reminder = reminders.find(
                  (item) => item.dayPlanTaskId === task.id,
                );

                return (
                  <div className="pl-3">
                    {reminder ? (
                      <div className="flex items-center gap-2 text-sm text-[var(--app-hint)]">
                        <button
                          type="button"
                          onClick={() => openReminderEditor(task, reminder)}
                          className="text-left text-[var(--app-text)] transition hover:opacity-70"
                        >
                          🔔{" "}
                          {new Date(reminder.remindAt).toLocaleTimeString(
                            "ru-RU",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeReminder(reminder)}
                          className="text-xs text-red-400 transition hover:text-red-300"
                        >
                          Удалить
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openReminderEditor(task)}
                        className="text-sm text-[var(--app-hint)] transition hover:text-[var(--app-text)]"
                      >
                        + Добавить напоминание
                      </button>
                    )}

                    {reminderTaskId === task.id && (
                      <div className="mt-2 space-y-2 rounded-xl border border-[var(--app-border)] p-3">
                        <label className="block text-xs text-[var(--app-hint)]">
                          Дата
                          <input
                            type="date"
                            value={reminderDate}
                            onChange={(event) =>
                              setReminderDate(event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-sm"
                          />
                        </label>
                        <label className="block text-xs text-[var(--app-hint)]">
                          Время
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(event) =>
                              setReminderTime(event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-sm"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void saveReminder()}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          Сохранить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAddTask();
            }}
            placeholder="Ввести задачу..."
            aria-label="Название задачи"
          />
          <button
            type="button"
            onClick={handleAddTask}
            className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-medium text-[var(--app-primary)] transition hover:bg-[var(--app-bg)]"
          >
            Добавить
          </button>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Дата и повтор</legend>
          {[
            ["today", "Только сегодня"],
            ["tomorrow", "Завтра"],
            ["custom", "Выбрать дату"],
            ["repeat", "Повторять"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm text-[var(--app-hint)]"
            >
              <input
                type="radio"
                name="day-plan-date"
                value={value}
                checked={dateMode === value}
                onChange={(event) => setDateMode(event.target.value)}
                className="h-4 w-4 accent-[var(--app-primary)]"
              />
              <span>{label}</span>
              {value === "repeat" && (
                <span className="ml-auto text-lg">&gt;</span>
              )}
            </label>
          ))}
        </fieldset>
      </div>
    </Modal>
  );
}

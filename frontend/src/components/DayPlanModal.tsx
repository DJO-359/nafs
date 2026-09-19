import { createPortal } from "react-dom";
import { useState } from "react";
import { toast } from "sonner";
import type { Reminder } from "../api/reminder.api";
import type { DayPlanTask } from "../hooks/useDayPlan";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useReminder } from "../hooks/useReminder";
import { useUpdateReminder } from "../hooks/useUpdateReminder";
import { useDeleteReminder } from "../hooks/useDeleteReminder";
import {
  getLocalDateString,
  getMinimumReminderTime,
  toReminderIso,
  validateReminderDateTime,
} from "../lib/reminder-date";

interface Props {
  open: boolean;
  tasks: DayPlanTask[];
  reminders: Reminder[];
  dayDate: string;
  onClose: () => void;
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onSave: () => void;
}

function formatTime(remindAt: string) {
  return new Date(remindAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateTimeParts(remindAt: string) {
  const date = new Date(remindAt);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

const DAY_PLAN_SCROLL_LOCK_OPTIONS = {
  allowTouchMoveWithin: ".day-plan-modal-content",
};

export default function DayPlanModal({
  open,
  tasks,
  reminders,
  dayDate,
  onClose,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onSave,
}: Props) {
  const [newTask, setNewTask] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [dateMode, setDateMode] = useState("today");
  const [customDate, setCustomDate] = useState(dayDate);
  const [reminderTaskId, setReminderTaskId] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState(dayDate);
  const [reminderTime, setReminderTime] = useState("");
  const createReminderMutation = useReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  useBodyScrollLock(open, DAY_PLAN_SCROLL_LOCK_OPTIONS);

  const selectedReminder = reminderTaskId
    ? (reminders.find((item) => item.dayPlanTaskId === reminderTaskId) ?? null)
    : null;

  function openReminderEditor(task: DayPlanTask, reminder?: Reminder) {
    setReminderTaskId(task.id);
    if (reminder) {
      const parts = getDateTimeParts(reminder.remindAt);
      setReminderDate(parts.date);
      setReminderTime(parts.time);
    } else {
      setReminderDate(dayDate);
      setReminderTime("");
    }
  }

  async function saveReminder() {
    if (!reminderTaskId || !reminderDate || !reminderTime) {
      toast.error("Выберите дату и время");
      return;
    }

    const validationError = validateReminderDateTime(
      reminderDate,
      reminderTime,
    );
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const dto = {
      dayPlanTaskId: reminderTaskId,
      remindAt: toReminderIso(reminderDate, reminderTime),
    };

    if (selectedReminder) {
      await updateReminderMutation.mutateAsync({
        id: selectedReminder.id,
        dto,
      });
    } else {
      const task = tasks.find((item) => item.id === reminderTaskId);
      if (!task) return;
      await createReminderMutation.mutateAsync({ title: task.title, ...dto });
    }

    setReminderTaskId(null);
  }

  async function removeReminder(reminder: Reminder) {
    await deleteReminderMutation.mutateAsync(reminder.id);
    setReminderTaskId(null);
  }

  async function toggleReminder(task: DayPlanTask, reminder?: Reminder) {
    if (reminder) {
      await removeReminder(reminder);
      return;
    }

    if (reminderTaskId === task.id) {
      setReminderTaskId(null);
      return;
    }

    openReminderEditor(task);
  }

  function handleAddTask() {
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask("");
    setIsAddingTask(false);
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[min(90vh,calc(100dvh-1.5rem))] max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#10232d]/90 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-white/10 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-white/25" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  План на день
                </h2>
                <p className="mt-1 max-w-[18rem] text-sm leading-relaxed text-white/55">
                  Добавьте задачи, которые хотите сделать сегодня или в
                  ближайшие дни.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Закрыть план на день"
              >
                ×
              </button>
            </div>
          </div>
        </header>

        <div
          className="day-plan-modal-content min-h-0 flex-[1_1_auto] overflow-x-hidden overflow-y-auto overscroll-y-contain p-4 touch-pan-y sm:p-5"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Задачи</h3>
                <span className="text-xs text-white/40">{tasks.length}</span>
              </div>

              <div className="space-y-2">
                {tasks.map((task) => {
                  const reminder = reminders.find(
                    (item) => item.dayPlanTaskId === task.id,
                  );

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                            task.completed
                              ? "border-emerald-300 bg-emerald-400 text-white"
                              : "border-white/35 bg-white/5 text-transparent hover:border-emerald-300"
                          }`}
                          aria-label={
                            task.completed
                              ? "Отметить невыполненной"
                              : "Отметить выполненной"
                          }
                          aria-pressed={task.completed}
                        >
                          ✓
                        </button>
                        <span
                          className={`min-w-0 flex-1 text-sm ${task.completed ? "text-white/40 line-through" : "text-white/90"}`}
                        >
                          {task.title}
                        </span>
                        {reminder && (
                          <button
                            type="button"
                            onClick={() => openReminderEditor(task, reminder)}
                            className="shrink-0 text-xs text-white/65 transition hover:text-white"
                          >
                            🔔 {formatTime(reminder.remindAt)}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveTask(task.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-white/35 transition hover:bg-red-400/10 hover:text-red-300"
                          aria-label={`Удалить задачу «${task.title}»`}
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-3 border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-white/55">
                            Напоминание
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={
                              Boolean(reminder) || reminderTaskId === task.id
                            }
                            aria-label={`${Boolean(reminder) || reminderTaskId === task.id ? "Выключить" : "Включить"} напоминание для задачи «${task.title}»`}
                            onClick={() => void toggleReminder(task, reminder)}
                            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
                              reminder || reminderTaskId === task.id
                                ? "border-emerald-300/60 bg-emerald-500"
                                : "border-white/15 bg-black/30"
                            }`}
                          >
                            <span
                              className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                reminder || reminderTaskId === task.id
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>

                        <div
                          className={`grid transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out ${
                            reminderTaskId === task.id
                              ? "mt-3 grid-rows-[1fr] opacity-100"
                              : "mt-0 grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-xs text-white/50">
                                Дата
                                <input
                                  type="date"
                                  value={reminderDate}
                                  min={getLocalDateString()}
                                  onChange={(event) =>
                                    setReminderDate(event.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-emerald-400"
                                />
                              </label>
                              <label className="text-xs text-white/50">
                                Время
                                <input
                                  type="time"
                                  value={reminderTime}
                                  min={getMinimumReminderTime(reminderDate)}
                                  onChange={(event) =>
                                    setReminderTime(event.target.value)
                                  }
                                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white outline-none focus:border-emerald-400"
                                />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => void saveReminder()}
                              className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                            >
                              Сохранить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isAddingTask ? (
                <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                  <input
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleAddTask();
                    }}
                    placeholder="Введите задачу..."
                    aria-label="Название задачи"
                    autoFocus
                    className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="rounded-xl bg-emerald-500 px-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    Добавить
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTask(true)}
                  className="w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-white/55 transition hover:border-emerald-300/50 hover:text-emerald-300"
                >
                  + Добавить ещё задачу
                </button>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                Дата и повтор
              </h3>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                {[
                  ["today", "Только сегодня"],
                  ["tomorrow", "Завтра"],
                  ["custom", "Выбрать дату"],
                  ["repeat", "Повторять"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${dateMode === value ? "bg-emerald-400/10 text-white" : "text-white/55 hover:bg-white/5"}`}
                  >
                    <input
                      type="radio"
                      name="day-plan-date"
                      value={value}
                      checked={dateMode === value}
                      onChange={(event) => setDateMode(event.target.value)}
                      className="h-4 w-4 accent-emerald-400"
                    />
                    <span>{label}</span>
                    {value === "repeat" && (
                      <span className="ml-auto text-lg">&gt;</span>
                    )}
                  </label>
                ))}
                {dateMode === "custom" && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(event) => setCustomDate(event.target.value)}
                    className="mx-3 mb-2 w-[calc(100%-1.5rem)] rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white"
                  />
                )}
              </div>
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-white/10 bg-black/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-white/15 px-5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSave}
            className="min-h-11 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,185,129,0.2)] transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Сохранить
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

import { useState } from "react";
import type { DayPlanTask } from "../hooks/useDayPlan";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

interface Props {
  open: boolean;
  tasks: DayPlanTask[];
  onClose: () => void;
  onAddTask: (title: string) => void;
  onRemoveTask: (id: string) => void;
  onSave: () => void;
}

export default function DayPlanModal({
  open,
  tasks,
  onClose,
  onAddTask,
  onRemoveTask,
  onSave,
}: Props) {
  const [newTask, setNewTask] = useState("");
  const [dateMode, setDateMode] = useState("today");

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
            <div
              key={task.id}
              className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4"
            >
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

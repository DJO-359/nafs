import type { DayPlanTask } from "../hooks/useDayPlan";
import type { Reminder } from "../api/reminder.api";

interface Props {
  tasks: DayPlanTask[];
  reminders: Reminder[];
  onToggleTask: (id: string) => void;
  onOpen: () => void;
}

export default function DayPlanCard({
  tasks,
  reminders,
  onToggleTask,
  onOpen,
}: Props) {
  const hasActivePlanReminder = tasks.some((task) =>
    reminders.some(
      (reminder) => reminder.dayPlanTaskId === task.id && !reminder.completed,
    ),
  );

  return (
    <section
      className="mt-3 rounded-[24px] border border-white/25 bg-black/20 px-4 py-4 text-white shadow-[0_16px_36px_rgba(0,0,0,0.2)] transition duration-300 hover:bg-black/15"
      style={{
        backdropFilter: "blur(16px) saturate(125%)",
        WebkitBackdropFilter: "blur(16px) saturate(125%)",
        boxShadow:
          "inset 0 1px rgba(255,255,255,0.14), 0 16px 36px rgba(0,0,0,0.2)",
      }}
      aria-label="План на сегодня"
    >
      <div className="flex min-h-11 items-center justify-between gap-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
          ПЛАН НА СЕГОДНЯ
        </span>

        <div className="flex items-center gap-1">
          <span
            className="relative flex h-8 w-8 items-center justify-center text-lg text-white/90"
            aria-hidden="true"
          >
            🔔
            {hasActivePlanReminder && (
              <span className="day-plan-reminder-dot absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </span>
          <button
            type="button"
            onClick={onOpen}
            className="group flex h-8 w-8 items-center justify-center text-left"
            aria-label="Открыть план на сегодня"
          >
            <span
              className="text-2xl font-light text-white/90 transition-transform duration-200 group-active:translate-x-1"
              aria-hidden="true"
            >
              &gt;
            </span>
          </button>
        </div>
      </div>

      <div className="mt-1 space-y-1">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleTask(task.id)}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-1 text-left transition-colors duration-200 hover:bg-white/10"
              aria-pressed={task.completed}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-200 ${
                  task.completed
                    ? "border-emerald-300 bg-emerald-400 text-white"
                    : "border-white/60 bg-white/5 text-transparent"
                }`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug transition-all duration-200">
                <span
                  className={
                    task.completed
                      ? "text-white/55 line-through"
                      : "text-white/90"
                  }
                >
                  {task.title}
                </span>
                {reminders
                  .filter(
                    (reminder) =>
                      reminder.dayPlanTaskId === task.id && !reminder.completed,
                  )
                  .slice(0, 1)
                  .map((reminder) => (
                    <span
                      key={reminder.id}
                      className="ml-2 whitespace-nowrap text-xs text-white/70"
                    >
                      🔔{" "}
                      {new Date(reminder.remindAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ))}
              </span>
            </button>
          ))
        ) : (
          <button
            type="button"
            onClick={onOpen}
            className="min-h-11 w-full rounded-xl px-1 text-left text-sm text-white/65 transition hover:bg-white/10"
          >
            Добавьте задачи на сегодня
          </button>
        )}
      </div>
    </section>
  );
}

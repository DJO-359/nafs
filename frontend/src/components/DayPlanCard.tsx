import type { DayPlanTask } from "../hooks/useDayPlan";

interface Props {
  tasks: DayPlanTask[];
  onToggleTask: (id: string) => void;
  onOpen: () => void;
}

export default function DayPlanCard({ tasks, onToggleTask, onOpen }: Props) {
  return (
    <section
      className="mt-3 rounded-[20px] border border-white/25 bg-black/10 px-4 py-3 text-white"
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "inset 0 1px rgba(255,255,255,0.12)",
      }}
      aria-label="План на сегодня"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-11 flex-1 items-center justify-between text-left"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
            ПЛАН НА СЕГОДНЯ
          </span>
          <span
            className="text-2xl font-semibold text-white/90"
            aria-hidden="true"
          >
            &gt;
          </span>
        </button>
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
              <span
                className={`min-w-0 flex-1 text-sm leading-snug transition-all duration-200 ${
                  task.completed
                    ? "text-white/55 line-through"
                    : "text-white/90"
                }`}
              >
                {task.title}
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

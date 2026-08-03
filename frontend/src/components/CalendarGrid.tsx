import type { CalendarDay } from "../api/calendar.api";

interface Props {
  days: CalendarDay[];
  onSelect: (date: string) => void;
}

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Разбирает YYYY-MM-DD как локальную дату.
 * new Date("2026-07-28") трактуется как полночь UTC, поэтому западнее
 * Гринвича день сдвигался на предыдущий.
 */
function parseDay(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

export default function CalendarGrid({ days, onSelect }: Props) {
  if (!days.length) return null;

  // Приводим к понедельнику как первому дню недели
  const firstWeekday = (parseDay(days[0].date).getDay() + 6) % 7;
  const today = todayString();

  return (
    <>
      <div className="mb-2 grid grid-cols-7 text-center text-sm font-semibold text-[var(--app-hint)]">
        {WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const isToday = day.date === today;

          const color =
            day.status === "success"
              ? "bg-emerald-500 text-white"
              : day.status === "partial"
                ? "bg-yellow-300 text-black"
                : "bg-[var(--app-bg)] text-[var(--app-hint)]";

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(day.date)}
              className={`aspect-square rounded-xl transition hover:scale-105 ${color} ${
                isToday ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {parseDay(day.date).getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500" />
          День заполнен
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-300" />
          Частично заполнен
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[var(--app-bg)] ring-1 ring-[var(--app-border)]" />
          Нет записей
        </div>
      </div>
    </>
  );
}

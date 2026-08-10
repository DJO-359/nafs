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
          const hasEntries = day.status !== "empty";
          const visiblePinEmojis = (day.pinEmojis ?? []).filter(Boolean);

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(day.date)}
              className={`flex min-h-[72px] flex-col items-center justify-start rounded-xl border border-transparent px-1 py-1 transition hover:scale-[1.02] ${
                isToday ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <span className="text-sm font-medium text-[var(--app-text)]">
                {parseDay(day.date).getDate()}
              </span>

              {hasEntries && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}

              {visiblePinEmojis.length > 0 && (
                <div className="mt-1 flex max-w-full flex-wrap items-center justify-center gap-1 text-[10px] leading-none text-[var(--app-text)]">
                  {visiblePinEmojis.map((emoji, index) => (
                    <span key={`${day.date}-${emoji}-${index}`}>{emoji}</span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

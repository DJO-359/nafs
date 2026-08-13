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

  const firstWeekday = (parseDay(days[0].date).getDay() + 6) % 7;
  const today = todayString();

  return (
    <>
      <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-[var(--app-hint)]">
        {WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const isToday = day.date === today;
          const hasEntries = day.status !== "empty";

          const visiblePinEmojis = (day.pinEmojis ?? [])
            .filter(Boolean)
            .slice(0, 1);

          const hasPinEmoji = visiblePinEmojis.length > 0;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(day.date)}
              className={`flex min-h-[48px] flex-col items-center justify-start rounded-lg border border-transparent px-1 py-0.5 transition hover:scale-[1.02] ${
                isToday ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <span className="text-sm font-medium leading-5 text-[var(--app-text)]">
                {parseDay(day.date).getDate()}
              </span>

              {/* Если есть запись, но нет закреплённой иконки —
                  показываем зелёную точку */}
              {!hasPinEmoji && hasEntries && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}

              {/* Если есть закреплённая иконка —
                  показываем только её, без зелёной точки */}
              {hasPinEmoji && (
                <div className="mt-0.5 flex h-5 items-center justify-center text-[16px] leading-none">
                  <span>{visiblePinEmojis[0]}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

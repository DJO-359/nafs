import type { CalendarDay } from "../api/calendar.api";

interface Props {
  days: CalendarDay[];
  onSelect(date: string): void;
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function CalendarGrid({ days, onSelect }: Props) {
  if (!days.length) return null;

  const firstDate = new Date(days[0].date);

  // JS: воскресенье = 0
  let firstWeekday = firstDate.getDay();

  // переводим к понедельнику = 0
  firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const emptyCells = Array.from({ length: firstWeekday });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* дни недели */}

      <div className="mb-2 grid grid-cols-7 text-center text-sm font-semibold text-gray-500">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* календарь */}

      <div className="grid grid-cols-7 gap-2">
        {emptyCells.map((_, index) => (
          <div key={index} />
        ))}

        {days.map((day) => {
          const number = new Date(day.date).getDate();

          const isToday = day.date === today;

          const color =
            day.status === "success"
              ? "bg-emerald-500 text-white"
              : day.status === "partial"
                ? "bg-yellow-300"
                : "bg-gray-100";

          return (
            <button
              key={day.date}
              onClick={() => onSelect(day.date)}
              className={`
                aspect-square
                rounded-xl
                transition
                hover:scale-105
                ${color}
                ${isToday ? "ring-2 ring-blue-500" : ""}
              `}
            >
              {number}
            </button>
          );
        })}
      </div>

      {/* легенда */}

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
          <div className="h-4 w-4 rounded bg-gray-200" />
          Нет записей
        </div>
      </div>
    </>
  );
}

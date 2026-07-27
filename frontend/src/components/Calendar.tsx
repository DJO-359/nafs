import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Шаг 1
import { useCalendar } from "../hooks/useCalendar";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthName = currentDate.toLocaleString("ru-RU", {
    month: "long",
  });

  const { data, isLoading } = useCalendar(year, month);
  const navigate = useNavigate(); // Шаг 2

  if (isLoading) {
    return <div>Загрузка календаря...</div>;
  }

  if (!data) {
    return null;
  }

  const firstDay = new Date(year, month - 1, 1);
  let offset = firstDay.getDay();
  offset = offset === 0 ? 6 : offset - 1;

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 2, 1))}
          className="rounded-lg border px-3 py-1 hover:bg-gray-100"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold">
          {monthName} {year}
        </h2>

        <button
          onClick={() => setCurrentDate(new Date(year, month, 1))}
          className="rounded-lg border px-3 py-1 hover:bg-gray-100"
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div>Сб</div>
        <div>Вс</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: offset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {data.days.map((day) => {
          const isToday = day.date === new Date().toISOString().slice(0, 10);

          return (
            // Шаг 3: обновлённый блок с onClick и анимацией
            <div
              key={day.date}
              onClick={() => navigate(`/day/${day.date}`)}
              className={`
                cursor-pointer
                flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition hover:scale-105
                ${
                  day.status === "success"
                    ? "bg-green-500 text-white"
                    : day.status === "partial"
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-100 text-gray-500"
                }
                ${isToday ? "ring-2 ring-blue-500" : ""}
              `}
            >
              {Number(day.date.slice(-2))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

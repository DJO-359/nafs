// frontend/src/pages/CalendarPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import CalendarGrid from "../components/CalendarGrid";
import { useCalendar } from "../hooks/useCalendar";

export default function CalendarPage() {
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1–12

  const { data, isLoading } = useCalendar(year, month);

  if (isLoading || !data) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold">📅 Календарь</h1>

      {/* Переключатель месяцев */}
      <div className="mb-4 flex items-center justify-between">
        <button
          className="rounded-lg border px-3 py-2"
          onClick={() => {
            if (month === 1) {
              setMonth(12);
              setYear((y) => y - 1);
            } else {
              setMonth((m) => m - 1);
            }
          }}
        >
          ◀
        </button>

        <h2 className="text-lg font-semibold">
          {new Date(year, month - 1).toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          className="rounded-lg border px-3 py-2"
          onClick={() => {
            if (month === 12) {
              setMonth(1);
              setYear((y) => y + 1);
            } else {
              setMonth((m) => m + 1);
            }
          }}
        >
          ▶
        </button>
      </div>

      <Card>
        <CalendarGrid
          days={data.days}
          onSelect={(date) => navigate(`/day/${date}`)}
        />
      </Card>
    </div>
  );
}

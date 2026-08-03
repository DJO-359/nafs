import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import CalendarGrid from "../components/CalendarGrid";
import QueryState from "../components/ui/QueryState";
import { useCalendar } from "../hooks/useCalendar";
import { useBackButton } from "../hooks/useBackButton";

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const query = useCalendar(year, month);

  useBackButton();

  function shiftMonth(delta: number) {
    const next = month + delta;

    if (next < 1) {
      setMonth(12);
      setYear((value) => value - 1);
      return;
    }

    if (next > 12) {
      setMonth(1);
      setYear((value) => value + 1);
      return;
    }

    setMonth(next);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📅 Календарь</h1>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg border border-[var(--app-border)] px-3 py-2"
          aria-label="Предыдущий месяц"
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
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg border border-[var(--app-border)] px-3 py-2"
          aria-label="Следующий месяц"
        >
          ▶
        </button>
      </div>

      <Card>
        <QueryState query={query}>
          {(data) => (
            <CalendarGrid
              days={data.days}
              onSelect={(date) => navigate(`/day/${date}`)}
            />
          )}
        </QueryState>
      </Card>
    </div>
  );
}

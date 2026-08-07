import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import QueryState from "../components/ui/QueryState";
import { useDayByDate } from "../hooks/useDayByDate";
import { useBackButton } from "../hooks/useBackButton";
import type { DiaryEntry } from "../types/day";

function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DayHistoryPage() {
  const { date = "" } = useParams();
  const query = useDayByDate(date);
  const navigate = useNavigate();

  useBackButton();

  return (
    <div className="space-y-4">
      <QueryState query={query}>
        {(day) => (
          <>
            <h1 className="text-2xl font-bold">📅 {formatDay(day.date)}</h1>

            <Card>
              <h2 className="mb-2 font-semibold">🧭 Намерение</h2>

              {day.intention ? (
                <>
                  <div>{day.intention.text}</div>
                  <div className="mt-2 text-sm text-emerald-600">
                    {day.intention.completed
                      ? "✅ Выполнено"
                      : "⏳ Не выполнено"}
                  </div>
                </>
              ) : (
                <div className="text-[var(--app-hint)]">Нет намерения</div>
              )}
            </Card>

            <Card>
              <h2 className="mb-2 font-semibold">⏰ Напоминания</h2>

              {day.reminders.length === 0 ? (
                <div className="text-[var(--app-hint)]">Нет напоминаний</div>
              ) : (
                <ul className="space-y-2">
                  {day.reminders.map((item) => (
                    <li key={item.id}>
                      {item.completed ? "✅" : "⭕"} {item.title}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="mb-2 font-semibold">📖 Дневник</h2>

              {day.diary === null ? (
                <div className="space-y-4">
                  <EmptyState
                    icon="📖"
                    title="За этот день пока нет записей."
                  />
                  <Button
                    type="button"
                    onClick={() => navigate("/", { replace: false })}
                  >
                    Написать запись
                  </Button>
                </div>
              ) : (
                (() => {
                  const entry = day.diary as unknown as DiaryEntry;

                  return (
                    <div className="space-y-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                      <div className="mb-2 text-sm text-[var(--app-hint)]">
                        {formatDay(entry.date)}
                      </div>
                      <p className="whitespace-pre-wrap text-white">
                        {entry.content}
                      </p>
                    </div>
                  );
                })()
              )}
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}

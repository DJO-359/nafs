import { useParams } from "react-router-dom";

import Card from "../components/ui/Card";
import QueryState from "../components/ui/QueryState";
import { useDayByDate } from "../hooks/useDayByDate";
import { useBackButton } from "../hooks/useBackButton";

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

              {day.diary ? (
                <p className="whitespace-pre-wrap">{day.diary.content}</p>
              ) : (
                <div className="text-[var(--app-hint)]">Записи нет</div>
              )}
            </Card>
          </>
        )}
      </QueryState>
    </div>
  );
}

import Card from "../components/ui/Card";
import QueryState from "../components/ui/QueryState";
import { useDiaryHistory } from "../hooks/useDiaryHistory";
import { useBackButton } from "../hooks/useBackButton";

function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const query = useDiaryHistory();

  useBackButton();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">📖 История дневника</h1>

      {/* Раньше здесь читалось data.length по возможному undefined:
          при ошибке запроса страница падала с TypeError */}
      <QueryState
        query={query}
        isEmpty={(entries) => entries.length === 0}
        emptyTitle="Записей пока нет"
      >
        {(entries) => (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="mb-2 text-sm text-[var(--app-hint)]">
                  {formatDay(entry.date)}
                </div>

                <p className="whitespace-pre-wrap">{entry.content}</p>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

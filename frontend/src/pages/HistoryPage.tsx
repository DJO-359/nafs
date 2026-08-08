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

function getPastelNoteBackground(color: string): string {
  const normalized = color?.toLowerCase();

  const pastelMap: Record<string, string> = {
    "#ffffff": "#ffffff",
    "#10b981": "#e8f7f0",
    "#14b8a6": "#dbf1ec",
    "#3b82f6": "#deecff",
    "#8b5cf6": "#eee3ff",
    "#f59e0b": "#fff3d1",
    "#ef4444": "#ffe4e4",
  };

  return pastelMap[normalized] ?? "#ffffff";
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
              <Card
                key={entry.id}
                className="border border-[var(--app-border)]"
                style={{
                  backgroundColor: getPastelNoteBackground(entry.color),
                }}
              >
                <div className="mb-3 text-sm text-[var(--app-hint)]">
                  {formatDay(entry.date)}
                </div>

                <p className="whitespace-pre-wrap text-black">
                  {entry.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

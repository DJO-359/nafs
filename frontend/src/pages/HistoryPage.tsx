import Card from "../components/ui/Card";
import { useDiaryHistory } from "../hooks/useDiaryHistory";
import { Link } from "react-router-dom";

export default function HistoryPage() {
  const { data, isLoading } = useDiaryHistory();

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <div className="mb-4">
        <Link
          to="/"
          className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
        >
          ← Назад
        </Link>
      </div>

      <h1 className="text-2xl font-bold">📖 История дневника</h1>

      {data.length === 0 ? (
        <Card>
          <p>Записей пока нет.</p>
        </Card>
      ) : (
        data.map((entry: any) => (
          <Card key={entry.id}>
            <div className="mb-2 text-sm text-gray-500">
              {new Date(entry.createdAt).toLocaleString("ru-RU")}
            </div>
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </Card>
        ))
      )}
    </div>
  );
}

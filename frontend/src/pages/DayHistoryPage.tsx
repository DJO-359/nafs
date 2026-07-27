import { useParams } from "react-router-dom";
import { useDayByDate } from "../hooks/useDayByDate";

export default function DayHistoryPage() {
  const { date } = useParams();

  const { data, isLoading } = useDayByDate(date!);

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <main className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">📅 {data.date}</h1>

      {/* Намерение */}
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">🧭 Намерение</h2>

        {data.intention ? (
          <>
            <div>{data.intention.text}</div>
            <div className="mt-2 text-green-600">
              {data.intention.completed ? "✅ Выполнено" : "⏳ Не выполнено"}
            </div>
          </>
        ) : (
          <div className="text-gray-500">Нет намерения</div>
        )}
      </div>

      {/* Напоминания */}
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">⏰ Напоминания</h2>

        {data.reminders.length === 0 ? (
          <div className="text-gray-500">Нет напоминаний</div>
        ) : (
          <ul className="space-y-2">
            {data.reminders.map((item: any) => (
              <li key={item.id}>
                {item.completed ? "✅" : "⭕"} {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Дневник */}
      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">📖 Дневник</h2>

        {data.diary ? (
          <p>{data.diary.content}</p>
        ) : (
          <div className="text-gray-500">Записи нет</div>
        )}
      </div>
    </main>
  );
}

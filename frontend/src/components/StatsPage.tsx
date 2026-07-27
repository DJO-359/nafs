import { useStats } from "../hooks/useStats";

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="text-sm text-gray-500">{title}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

export default function StatsPage() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">📊 Статистика</h1>

      <StatCard title="🔥 Серия дней" value={data.streak} />

      <StatCard title="📅 Активных дней" value={data.activeDays} />

      <StatCard title="📖 Записей дневника" value={data.diaryEntries} />

      <StatCard
        title="🎯 Намерения"
        value={`${data.completedIntentions} / ${data.intentions}`}
      />

      <StatCard
        title="⏰ Напоминания"
        value={`${data.completedReminders} / ${data.reminders}`}
      />
    </main>
  );
}

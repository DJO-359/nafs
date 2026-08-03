import { useStats } from "../hooks/useStats";
import QueryState from "./ui/QueryState";

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[var(--app-surface)] p-5 shadow">
      <div className="text-sm text-[var(--app-hint)]">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

export default function StatsView() {
  const query = useStats();

  return (
    <main className="space-y-4">
      <h1 className="text-3xl font-bold">📊 Статистика</h1>

      <QueryState query={query}>
        {(data) => (
          <div className="space-y-4">
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
          </div>
        )}
      </QueryState>
    </main>
  );
}

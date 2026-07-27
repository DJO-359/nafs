import Card from "./ui/Card";

interface Reminder {
  completed: boolean;
}

interface ReminderGroup {
  date: string;
  items: Reminder[];
}

interface Props {
  reminders: {
    today: Reminder[];
    tomorrow: Reminder[];
    upcoming: ReminderGroup[];
  };
}

export default function ProgressCard({ reminders }: Props) {
  const allReminders = [
    ...reminders.today,
    ...reminders.tomorrow,
    ...reminders.upcoming.flatMap((group) => group.items),
  ];

  const total = allReminders.length;
  const completed = allReminders.filter((r) => r.completed).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">📈 Прогресс напоминаний</h2>

      <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-emerald-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm text-gray-600">
        Выполнено {completed} из {total} напоминаний
      </p>

      <p className="mt-1 text-sm font-medium text-emerald-700">{percent}%</p>
    </Card>
  );
}

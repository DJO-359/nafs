import { useEffect, useState } from "react";
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

function getProgressCaption(percent: number) {
  if (percent === 100) return "✨ Сегодня прожит осознанно";
  if (percent >= 76) return "🌙 День подходит к завершению";
  if (percent >= 51) return "☀️ День идёт своим чередом";
  if (percent >= 26) return "🌿 Спокойный ритм";
  return "🌅 День начинается";
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
  const captionText = getProgressCaption(percent);

  const [caption, setCaption] = useState(captionText);
  const [captionVisible, setCaptionVisible] = useState(true);

  useEffect(() => {
    if (captionText === caption) return;

    setCaptionVisible(false);
    const timeout = window.setTimeout(
      () => {
        setCaption(captionText);
        setCaptionVisible(true);
      },
      percent === 100 ? 300 : 250,
    );

    return () => window.clearTimeout(timeout);
  }, [caption, captionText, percent]);

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">📈 Прогресс напоминаний</h2>

      <div className="mb-2 h-3 overflow-hidden rounded-full bg-[var(--app-border)]">
        <div
          className="h-full bg-emerald-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mb-2 text-sm text-[var(--app-hint)]">
        Выполнено {completed} из {total} напоминаний
      </div>

      <p className="mt-1 text-sm font-medium text-emerald-700">{percent}%</p>

      <div
        className={`mt-3 text-sm text-[var(--app-hint)] transition-all duration-[300ms] ease-out ${captionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        {caption}
      </div>
    </Card>
  );
}

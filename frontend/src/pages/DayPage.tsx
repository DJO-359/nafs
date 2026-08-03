import { Link } from "react-router-dom";

import IntentionCard from "../components/IntentionCard";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard from "../components/habits/HabitsCard";
import QueryState from "../components/ui/QueryState";
import { useDay } from "../hooks/useDay";
import { useIntention } from "../hooks/useIntention";
import { useReminder } from "../hooks/useReminder";
import type { CreateReminderDto } from "../api/reminder.api";

function greetingFor(hour: number): string {
  if (hour < 6) return "Доброй ночи 🌙";
  if (hour < 12) return "Доброе утро ☀️";
  if (hour < 18) return "Добрый день 🌤";
  return "Добрый вечер 🌙";
}

/** Разбирает YYYY-MM-DD как локальную дату, без сдвига через UTC. */
function parseDay(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function DayPage() {
  const dayQuery = useDay();
  const { createMutation, completeMutation } = useIntention();
  const reminderMutation = useReminder();

  // Контейнер и отступы даёт Layout. Раньше здесь был второй min-h-screen
  // с собственным p-4, из-за чего отступы удваивались.
  return (
    <QueryState query={dayQuery}>
      {(day) => {
        const remainingToday = day.reminders.today.filter(
          (item) => !item.completed,
        ).length;

        return (
          <div>
            <header className="mb-6">
              <h1 className="text-3xl font-bold">
                {greetingFor(new Date().getHours())}
              </h1>

              <p className="mt-1 text-[var(--app-hint)]">
                Сегодня{" "}
                {parseDay(day.date).toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </header>

            <div className="mb-6 rounded-xl bg-emerald-600 p-4 text-white">
              <div className="text-lg font-semibold">Сегодня</div>

              <div className="mt-3 flex justify-between">
                <div>
                  <div className="text-2xl font-bold">{remainingToday}</div>
                  <div className="text-sm opacity-80">Осталось</div>
                </div>

                <div>
                  <div className="text-2xl font-bold">
                    {day.intention?.completed ? "✓" : "○"}
                  </div>
                  <div className="text-sm opacity-80">Намерение</div>
                </div>

                <div>
                  <div className="text-2xl font-bold">
                    {day.diary ? "✓" : "○"}
                  </div>
                  <div className="text-sm opacity-80">Дневник</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <IntentionCard
                intention={day.intention}
                onCreate={async (text: string) => {
                  await createMutation.mutateAsync(text);
                }}
                onComplete={async () => {
                  await completeMutation.mutateAsync();
                }}
              />

              <HabitsCard />

              <ReminderList
                reminders={day.reminders}
                onCreate={async (dto: CreateReminderDto) => {
                  await reminderMutation.mutateAsync(dto);
                }}
              />

              <DiaryCard diary={day.diary} />

              <ProgressCard reminders={day.reminders} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/calendar"
                className="rounded-xl bg-[var(--app-surface)] p-4 text-center shadow transition hover:shadow-md"
              >
                📅
                <div className="mt-2 font-medium">Календарь</div>
              </Link>

              <Link
                to="/history"
                className="rounded-xl bg-[var(--app-surface)] p-4 text-center shadow transition hover:shadow-md"
              >
                📖
                <div className="mt-2 font-medium">История</div>
              </Link>
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}

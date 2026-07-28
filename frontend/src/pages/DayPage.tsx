// frontend/src/pages/DayPage.tsx

import IntentionCard from "../components/IntentionCard";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard from "../components/habits/HabitsCard";
import { useDay } from "../hooks/useDay";
import { useIntention } from "../hooks/useIntention";
import { useReminder } from "../hooks/useReminder";
import { Link } from "react-router-dom";
import type { CreateReminderDto } from "../api/reminder.api"; // импорт DTO

export default function DayPage() {
  const { data: day, isLoading } = useDay();

  const { createMutation, completeMutation } = useIntention();
  const reminderMutation = useReminder();

  const handleCreateIntention = async (text: string) => {
    await createMutation.mutateAsync(text);
  };

  const handleCompleteIntention = async () => {
    await completeMutation.mutateAsync();
  };

  // Исправленный тип – используем полный CreateReminderDto
  const handleCreateReminder = async (dto: CreateReminderDto) => {
    await reminderMutation.mutateAsync(dto);
  };

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!day) {
    return <div className="p-4">Не удалось загрузить данные.</div>;
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? "Доброй ночи 🌙"
      : hour < 12
        ? "Доброе утро ☀️"
        : hour < 18
          ? "Добрый день 🌤"
          : "Добрый вечер 🌙";

  // Подсчёт оставшихся напоминаний на сегодня
  const remainingToday = day.reminders.today.filter((r) => !r.completed).length;

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-md">
        {/* Приветствие */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{greeting}</h1>
          <p className="mt-1 text-gray-500">
            Сегодня{" "}
            {new Date(day.date).toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Блок быстрой статистики */}
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
              <div className="text-2xl font-bold">{day.diary ? "✓" : "○"}</div>
              <div className="text-sm opacity-80">Дневник</div>
            </div>
          </div>
        </div>

        {/* Основные карточки в новом порядке */}
        <div className="space-y-4">
          <IntentionCard
            intention={day.intention}
            onCreate={handleCreateIntention}
            onComplete={handleCompleteIntention}
          />

          <HabitsCard />

          <ReminderList
            reminders={day.reminders}
            onCreate={handleCreateReminder}
          />

          <DiaryCard diary={day.diary} />

          {/* Прогресс – итог дня */}
          <ProgressCard reminders={day.reminders} />
        </div>

        {/* Быстрые действия (Календарь и История) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/calendar"
            className="rounded-xl bg-white p-4 text-center shadow transition hover:shadow-md"
          >
            📅
            <div className="mt-2 font-medium">Календарь</div>
          </Link>

          <Link
            to="/history"
            className="rounded-xl bg-white p-4 text-center shadow transition hover:shadow-md"
          >
            📖
            <div className="mt-2 font-medium">История</div>
          </Link>
        </div>
      </div>
    </main>
  );
}

import { Link } from "react-router-dom";

import { useRef } from "react";
import IntentionCard from "../components/IntentionCard";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard, {
  type HabitsCardHandle,
} from "../components/habits/HabitsCard";
import QueryState from "../components/ui/QueryState";
import { useDay } from "../hooks/useDay";
import { useHabits } from "../hooks/useHabits";
import { useIntention } from "../hooks/useIntention";
import { useReminder } from "../hooks/useReminder";
import type { CreateReminderDto } from "../api/reminder.api";

import morningImage from "../assets/images/backgrounds/morning.jpg";
import dayImage from "../assets/images/backgrounds/day.jpg";
import eveningImage from "../assets/images/backgrounds/evening.jpg";
import nightImage from "../assets/images/backgrounds/night.jpg";

type DayPart = "morning" | "day" | "evening" | "night";

const heroThemes: Record<DayPart, { greeting: string; image: string }> = {
  morning: {
    greeting: "Доброе утро ☀️",
    image: morningImage,
  },
  day: {
    greeting: "Добрый день ☀️",
    image: dayImage,
  },
  evening: {
    greeting: "Добрый вечер 🌅",
    image: eveningImage,
  },
  night: {
    greeting: "Доброй ночи 🌙",
    image: nightImage,
  },
};

function getDayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

/** Разбирает YYYY-MM-DD как локальную дату, без сдвига через UTC. */
function parseDay(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function DayPage() {
  const dayQuery = useDay();
  const { data: habits = [] } = useHabits();
  const { createMutation, completeMutation } = useIntention();
  const reminderMutation = useReminder();
  const habitsRef = useRef<HabitsCardHandle>(null);

  // Контейнер и отступы даёт Layout. Раньше здесь был второй min-h-screen
  // с собственным p-4, из-за чего отступы удваивались.
  return (
    <QueryState query={dayQuery}>
      {(day) => {
        const visibleHabits = habits.slice(0, 4);
        const progressPercent =
          habits.length === 0
            ? 0
            : Math.round(
                habits.reduce((value, habit) => value + habit.progress, 0) /
                  habits.length,
              );
        const ringRadius = 45;
        const ringCircumference = 2 * Math.PI * ringRadius;
        const ringOffset = ringCircumference * (1 - progressPercent / 100);

        const currentHour = new Date().getHours();
        const dayPart = getDayPart(currentHour);
        const theme = heroThemes[dayPart];

        return (
          <div>
            <header
              className="mb-6 overflow-hidden rounded-[28px] shadow-xl transition-all duration-300 ease-out"
              style={{
                minHeight: 280,
                backgroundImage: `linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), url(${theme.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative h-full w-full px-6 py-6 sm:px-8 sm:py-8">
                <div className="relative z-10 flex h-full flex-col justify-between text-white">
                  <div>
                    {/* <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/80">
                      Сегодня
                    </p> */}
                    <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                      {theme.greeting}
                    </h1>
                  </div>

                  <p className="text-base text-white/75">
                    {parseDay(day.date).toLocaleDateString("ru-RU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </header>

            <div
              className="mb-4 overflow-hidden rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
              style={{
                background: "linear-gradient(180deg, #10263F 0%, #132F4B 100%)",
                boxShadow: "inset 0 1px rgba(255,255,255,.05)",
              }}
            >
              <div className="grid grid-cols-[35%_1px_65%] items-center gap-6 h-full">
                <div className="flex h-full flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                    {/* <span className="text-lg">☀️</span> */}
                    <span>прогресс дня</span>
                  </div>

                  <div className="mt-3 flex flex-col items-start gap-3">
                    <div className="relative h-[110px] w-[110px]">
                      <svg viewBox="0 0 100 100" className="h-full w-full">
                        <circle
                          cx="50"
                          cy="50"
                          r={45}
                          className="fill-none stroke-white/15 stroke-10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r={45}
                          className="fill-none stroke-10 transition-all duration-400 ease-out"
                          stroke={
                            progressPercent <= 30
                              ? "#EF4444"
                              : progressPercent <= 70
                                ? "#F59E0B"
                                : "#22C55E"
                          }
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[34px] font-bold text-white">
                        {progressPercent}%
                      </div>
                    </div>

                    {/* <p className="mt-3 text-sm leading-6 text-white/75">
                      {progressPercent === 100
                        ? "✨ Сегодня прожит осознанно"
                        : progressPercent >= 76
                          ? "🌙 День подходит к завершению"
                          : progressPercent >= 51
                            ? "☀️ День идёт своим чередом"
                            : progressPercent >= 26
                              ? "🌿 Спокойный ритм"
                              : "🌅 День начинается"}
                    </p> */}
                  </div>
                </div>

                <div className="h-30 w-px bg-white/10" />

                <div className="flex h-full flex-col justify-center">
                  {visibleHabits.length > 0 ? (
                    <div>
                      {visibleHabits.map((habit) => (
                        <div
                          key={habit.id}
                          className="flex items-center gap-3 mb-4 last:mb-0"
                        >
                          <div
                            className={`grid h-6.5 w-6.5 place-items-center rounded-full text-white ${habit.isCompletedToday ? "bg-emerald-500" : "bg-white/10 text-white/70"}`}
                          >
                            {habit.isCompletedToday ? "✔" : "○"}
                          </div>
                          <p className="text-[17px] font-medium text-white">
                            {habit.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/75">
                      🌱 Сегодня ещё нет привычек
                    </p>
                  )}
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

              <HabitsCard ref={habitsRef} />

              <ReminderList
                reminders={day.reminders}
                onCreate={async (dto: CreateReminderDto) => {
                  await reminderMutation.mutateAsync(dto);
                }}
              />

              <DiaryCard diary={day.diary} />

              <ProgressCard reminders={day.reminders} />
            </div>

            <div className="relative">
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

              <button
                type="button"
                onClick={() => habitsRef.current?.openCreate()}
                className="absolute left-1/2 bottom-[-24px] -translate-x-1/2 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition duration-[250ms] ease-out active:scale-[0.95]"
                aria-label="Добавить привычку"
              >
                <span className="text-[30px] font-semibold text-slate-900">
                  +
                </span>
              </button>
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}

import { Link } from "react-router-dom";

import { useRef } from "react";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard, {
  type HabitsCardHandle,
} from "../components/habits/HabitsCard";
import QueryState from "../components/ui/QueryState";
import { useDay } from "../hooks/useDay";
import { useHabits } from "../hooks/useHabits";
import { useReminder } from "../hooks/useReminder";
import type { CreateReminderDto } from "../api/reminder.api";

import morningImage from "../assets/images/backgrounds/morning.jpg";
import dayImage from "../assets/images/backgrounds/day.jpg";
import eveningImage from "../assets/images/backgrounds/evening.jpg";
import nightImage from "../assets/images/backgrounds/night.jpg";

type DayPart = "morning" | "day" | "evening" | "night";

const heroThemes: Record<DayPart, { greeting: string; image: string }> = {
  morning: {
    greeting: "Доброе утро",
    image: morningImage,
  },
  day: {
    greeting: "Добрый день",
    image: dayImage,
  },
  evening: {
    greeting: "Добрый вечер",
    image: eveningImage,
  },
  night: {
    greeting: "Доброй ночи",
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
  const reminderMutation = useReminder();
  const habitsRef = useRef<HabitsCardHandle>(null);

  // Контейнер и отступы даёт Layout. Раньше здесь был второй min-h-screen
  // с собственным p-4, из-за чего отступы удваивались.
  return (
    <QueryState query={dayQuery}>
      {(day) => {
        const completedHabits = habits.filter(
          (habit) => habit.isCompletedToday,
        ).length;
        const remainingHabits = habits.length - completedHabits;
        const progressPercent =
          habits.length === 0
            ? 0
            : Math.round((completedHabits / habits.length) * 100);

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

                  <div
                    className="mt-5 rounded-[22px] border border-[rgba(255,255,255,0.10)] bg-[rgba(20,32,52,0.45)] px-5 py-5"
                    style={{ backdropFilter: "blur(18px)" }}
                  >
                    <p className="text-[12px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.65)]">
                      ◎ намерение дня
                    </p>
                    <p className="mt-3 text-[28px] font-semibold text-white leading-tight">
                      {day.intention?.text
                        ? day.intention.text
                        : "Сегодня намерение ещё не выбрано."}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <div
              className="mb-4 overflow-hidden rounded-[20px] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
              style={{
                height: 118,
                background: "linear-gradient(180deg, #10263F, #132F4B)",
                boxShadow: "inset 0 1px rgba(255,255,255,.05)",
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[18px] font-semibold text-white">
                    Прогресс дня
                  </p>
                  <p className="text-[18px] font-semibold text-white">
                    {progressPercent}%
                  </p>
                </div>

                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5D8EFF]"
                    style={{
                      width: `${progressPercent}%`,
                      transition: "width .35s ease",
                    }}
                  />
                </div>

                <p className="text-sm text-white/75">
                  {habits.length === 0
                    ? "Нет привычек на сегодня"
                    : remainingHabits === 0
                      ? "Все привычки выполнены. Отличная работа."
                      : `Ещё ${remainingHabits} привычк${remainingHabits % 10 === 1 && remainingHabits !== 11 ? "а" : remainingHabits % 10 >= 2 && remainingHabits % 10 <= 4 && !(remainingHabits >= 12 && remainingHabits <= 14) ? "и" : ""} до идеального дня.`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
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

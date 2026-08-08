import { Link } from "react-router-dom";

import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard, {
  type HabitsCardHandle,
} from "../components/habits/HabitsCard";
import IntentionModal from "../components/IntentionModal";
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
  const { createMutation } = useIntention();
  const reminderMutation = useReminder();
  const habitsRef = useRef<HabitsCardHandle>(null);
  const [isIntentionOpen, setIsIntentionOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

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

        const activeRemindersCount =
          day.reminders.today.filter((reminder) => !reminder.completed).length +
          day.reminders.tomorrow.filter((reminder) => !reminder.completed)
            .length +
          day.reminders.upcoming
            .flatMap((group) => group.items)
            .filter((reminder) => !reminder.completed).length;
        const hasActiveReminders = activeRemindersCount > 0;

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
                <button
                  type="button"
                  onClick={() => setIsRemindersOpen(true)}
                  className="absolute right-6 top-6 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white/10 text-white transition duration-200 ease-out hover:scale-105 hover:bg-white/15 active:scale-95 pointer-events-auto"
                  aria-label="Открыть напоминания"
                >
                  <span className="text-xl">🔔</span>
                  {hasActiveReminders && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </button>

                <div className="relative z-10 flex h-full flex-col justify-between text-white">
                  <div>
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

                  <button
                    type="button"
                    onClick={() => setIsIntentionOpen(true)}
                    className="mt-5 block max-w-[290px] w-[78%] rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[rgba(15,20,28,0.22)] px-5 py-5 text-left text-white transition duration-250 ease-in-out hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{
                      backdropFilter: "blur(14px)",
                      boxShadow: "inset 0 1px rgba(255,255,255,.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[12px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.70)]">
                        ◎ намерение дня
                      </p>
                      <span className="text-[18px] font-semibold text-white">
                        &gt;
                      </span>
                    </div>
                    <p className="mt-3 text-[20px] font-semibold leading-[1.3] text-white">
                      {day.intention?.text
                        ? day.intention.text
                        : "Сегодня намерение ещё не выбрано."}
                    </p>
                  </button>
                  <IntentionModal
                    open={isIntentionOpen}
                    initialValue={day.intention?.text ?? ""}
                    onClose={() => setIsIntentionOpen(false)}
                    onSave={async (text) => {
                      await createMutation.mutateAsync(text);
                      setIsIntentionOpen(false);
                    }}
                  />
                </div>
              </div>
            </header>

            {createPortal(
              <AnimatePresence>
                {isRemindersOpen && (
                  <>
                    <motion.div
                      key="reminder-backdrop"
                      className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, pointerEvents: "none" }}
                      onClick={() => setIsRemindersOpen(false)}
                    />

                    <motion.div
                      key="reminder-sheet"
                      className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] bg-[var(--app-surface)] p-5 shadow-2xl"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%", pointerEvents: "none" }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.16em] text-[var(--app-hint)]">
                            Напоминания
                          </p>
                          <h2 className="text-xl font-semibold">
                            Быстрый доступ
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsRemindersOpen(false)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-slate-700 transition hover:bg-slate-100"
                          aria-label="Закрыть напоминания"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="max-h-[calc(90vh-108px)] overflow-y-auto pr-1">
                        <ReminderList
                          reminders={day.reminders}
                          onCreate={async (dto: CreateReminderDto) => {
                            await reminderMutation.mutateAsync(dto);
                          }}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body,
            )}

            <DiaryCard diary={day.diary} />

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

import { Link } from "react-router-dom";

import { createPortal } from "react-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ReminderList from "../components/ReminderList";
import DiaryCard from "../components/DiaryCard";
import TasbihCard from "../components/TasbihCard";
import ProgressCard from "../components/ProgressCard";
import HabitsCard from "../components/habits/HabitsCard";
import IntentionModal from "../components/IntentionModal";
import QueryState from "../components/ui/QueryState";
import { useDay } from "../hooks/useDay";
import { useIntention } from "../hooks/useIntention";
import { useReminder } from "../hooks/useReminder";
import type { CreateReminderDto } from "../api/reminder.api";

import morningImage from "../assets/images/backgrounds/morning.jpg";
import dayImage from "../assets/images/backgrounds/day.jpg";
import eveningImage from "../assets/images/backgrounds/evening.jpg";
import nightImage from "../assets/images/backgrounds/night.jpg";

type DayPart = "morning" | "day" | "evening" | "night";

const heroThemes: Record<DayPart, { image: string }> = {
  morning: {
    image: morningImage,
  },
  day: {
    image: dayImage,
  },
  evening: {
    image: eveningImage,
  },
  night: {
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
  const { createMutation } = useIntention();
  const reminderMutation = useReminder();
  const [isIntentionOpen, setIsIntentionOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  // Контейнер и отступы даёт Layout. Раньше здесь был второй min-h-screen
  // с собственным p-4, из-за чего отступы удваивались.
  return (
    <QueryState query={dayQuery}>
      {(day) => {
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
                minHeight: 320,
                backgroundImage: `linear-gradient(rgba(0,0,0,.20), rgba(0,0,0,.45)), url(${theme.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="relative h-full w-full px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setIsRemindersOpen(true)}
                  className="absolute right-5 top-5 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white/10 text-white transition duration-200 ease-out hover:scale-105 hover:bg-white/15 active:scale-95 pointer-events-auto"
                  aria-label="Открыть напоминания"
                >
                  <span className="text-xl">🔔</span>
                  {hasActiveReminders && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </button>

                <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between text-white">
                  <button
                    type="button"
                    onClick={() => setIsIntentionOpen(true)}
                    className="mt-2 block w-[76%] max-w-[320px] rounded-[20px] border border-white/30 bg-[rgba(255,255,255,0.09)] px-4 py-3 text-left text-white transition duration-250 ease-in-out hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.12)] active:scale-[0.98] sm:mt-3"
                    style={{
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      boxShadow: "inset 0 1px rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
                        НАМЕРЕНИЕ ДНЯ
                      </p>
                      <span className="text-2xl font-semibold text-white/90">
                        &gt;
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug text-white sm:text-base">
                      {day.intention?.text
                        ? day.intention.text
                        : "Выбери намерение"}
                    </p>
                  </button>

                  <p className="pt-2 text-sm text-white/85 sm:text-base">
                    {parseDay(day.date).toLocaleDateString("ru-RU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </header>

            <IntentionModal
              open={isIntentionOpen}
              initialValue={day.intention?.text ?? ""}
              onClose={() => setIsIntentionOpen(false)}
              onSave={async (text) => {
                await createMutation.mutateAsync(text);
                setIsIntentionOpen(false);
              }}
            />

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

            <div className="mb-4 grid grid-cols-2 gap-3">
              <DiaryCard diary={day.diary} />
              <TasbihCard />
            </div>

            <div className="space-y-4">
              <HabitsCard />

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
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}

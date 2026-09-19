import { createPortal } from "react-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ReminderList from "../components/ReminderList";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import DiaryCard from "../components/DiaryCard";
import TasbihCard from "../components/TasbihCard";
import HabitsCard from "../components/habits/HabitsCard";
import AddToHomeScreenCard from "../components/AddToHomeScreenCard";
import DayPlanCard from "../components/DayPlanCard";
import DayPlanModal from "../components/DayPlanModal";
import IntentionModal from "../components/IntentionModal";
import QueryState from "../components/ui/QueryState";
import { useDay } from "../hooks/useDay";
import { useDayPlan } from "../hooks/useDayPlan";
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
  const [isDayPlanOpen, setIsDayPlanOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const dayPlan = useDayPlan(dayQuery.data?.date ?? "");
  useBodyScrollLock(isRemindersOpen);

  // Контейнер и отступы даёт Layout. Раньше здесь был второй min-h-screen
  // с собственным p-4, из-за чего отступы удваивались.
  return (
    <QueryState query={dayQuery}>
      {(day) => {
        const currentHour = new Date().getHours();
        const dayPart = getDayPart(currentHour);
        const theme = heroThemes[dayPart];

        const dayPlanReminders = [
          ...day.reminders.today,
          ...day.reminders.tomorrow,
          ...day.reminders.upcoming.flatMap((group) => group.items),
        ];

        return (
          <div className="min-h-dvh w-full overflow-x-hidden bg-[#08151d]">
            <div className="relative isolate">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                  height: "calc(100% - 96px)",
                  backgroundImage: `linear-gradient(rgba(4,16,23,.38), rgba(4,16,23,.38)), url(${theme.image})`,
                }}
                aria-hidden="true"
              />

              <header className="relative z-10 min-h-[430px] overflow-hidden sm:min-h-[500px]">
                <div className="relative flex min-h-[430px] w-full flex-col px-4 pb-5 pt-[calc(env(safe-area-inset-top)+1rem)] sm:min-h-[500px] sm:px-7 sm:pb-7">
                  <div className="relative z-10 flex min-h-[398px] flex-1 flex-col justify-between text-white sm:min-h-[468px]">
                    <div className="mt-16 w-full sm:mt-20">
                      <DayPlanCard
                        tasks={dayPlan.tasks}
                        reminders={dayPlanReminders}
                        onToggleTask={dayPlan.toggleTask}
                        onOpen={() => setIsDayPlanOpen(true)}
                      />
                    </div>

                    <p className="pt-6 text-center text-sm font-medium lowercase tracking-wide text-white/85 sm:text-base">
                      {parseDay(day.date).toLocaleDateString("ru-RU", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>
              </header>

              <div className="relative z-10 -mt-8 mb-4 grid grid-cols-2 gap-3 px-4 pt-4 sm:px-6">
                <DiaryCard diary={day.diary} />
                <TasbihCard />
              </div>
            </div>

            <IntentionModal
              open={isIntentionOpen}
              initialValue={day.intention?.text ?? ""}
              onClose={() => setIsIntentionOpen(false)}
              onSave={async (text) => {
                await createMutation.mutateAsync(text);
                setIsIntentionOpen(false);
              }}
            />

            <DayPlanModal
              open={isDayPlanOpen}
              tasks={dayPlan.tasks}
              reminders={dayPlanReminders}
              dayDate={day.date}
              onClose={() => setIsDayPlanOpen(false)}
              onAddTask={dayPlan.addTask}
              onToggleTask={dayPlan.toggleTask}
              onRemoveTask={dayPlan.removeTask}
              onUpdateTaskSchedule={dayPlan.updateTaskSchedule}
              onSave={() => setIsDayPlanOpen(false)}
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

            <div className="space-y-4 px-4 sm:px-6">
              <HabitsCard />
              <AddToHomeScreenCard />
            </div>
          </div>
        );
      }}
    </QueryState>
  );
}

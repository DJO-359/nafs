import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import QueryState from "../components/ui/QueryState";
import CalendarGrid from "../components/CalendarGrid";
import { useCalendar } from "../hooks/useCalendar";
import { useDayByDate } from "../hooks/useDayByDate";
import { useBackButton } from "../hooks/useBackButton";
import { useDiary } from "../hooks/useDiary";
import type { DiaryEntry } from "../types/day";

type CalendarNavigationState = {
  fromCalendar?: boolean;
  calendarYear?: number;
  calendarMonth?: number;
};

function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

function formatEntryTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DayHistoryPage() {
  const { date = "" } = useParams();
  const location = useLocation();
  const state = location.state as CalendarNavigationState | null;
  const query = useDayByDate(date);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  console.log("[DayHistory] route date:", date);
  console.log("[DayHistory] query.data:", query.data);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [text, setText] = useState("");
  const diaryMutation = useDiary();

  const openNewEntry = () => {
    setEditingEntry(null);
    setText("");
    setIsDiaryOpen(true);
  };

  const openEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setText(entry.content);
    setIsDiaryOpen(true);
  };

  const closeEntry = () => {
    setText("");
    setEditingEntry(null);
    setIsDiaryOpen(false);
  };

  const calendarToday = todayString();
  const [calendarYear, setCalendarYear] = useState(
    state?.calendarYear ?? new Date().getFullYear(),
  );
  const [calendarMonth, setCalendarMonth] = useState(
    state?.calendarMonth ?? new Date().getMonth() + 1,
  );
  const calendarQuery = useCalendar(calendarYear, calendarMonth);

  const isToday = date === "" || date === calendarToday;
  const isFromCalendar = state?.fromCalendar === true;

  const closeCalendar = () => setIsCalendarOpen(false);

  const handleCalendarSelect = (selectedDate: string) => {
    setIsCalendarOpen(false);
    navigate(`/day/${selectedDate}`, {
      state: {
        fromCalendar: true,
        calendarYear,
        calendarMonth,
      },
    });
  };

  const shiftCalendarMonth = (delta: number) => {
    const next = calendarMonth + delta;

    if (next < 1) {
      setCalendarMonth(12);
      setCalendarYear((value) => value - 1);
      return;
    }

    if (next > 12) {
      setCalendarMonth(1);
      setCalendarYear((value) => value + 1);
      return;
    }

    setCalendarMonth(next);
  };

  const handleBack = useCallback(() => {
    if (isFromCalendar) {
      setIsCalendarOpen(true);
      return;
    }

    navigate(-1);
  }, [isFromCalendar, navigate]);

  useBackButton(handleBack);

  const onDiarySave = async () => {
    if (!text.trim()) return;

    await diaryMutation.mutateAsync({
      text: text.trim(),
      id: editingEntry?.id,
    });
    setText("");
    setEditingEntry(null);
    setIsDiaryOpen(false);
    void queryClient.invalidateQueries({ queryKey: ["day", date] });
  };

  return (
    <div className="pb-40">
      <QueryState query={query}>
        {(day) => {
          console.log("[DayHistory] day:", day);
          console.log("[DayHistory] day?.date:", day?.date);
          console.log("[DayHistory] BEFORE formatDay:", {
            day,
            dayDate: day?.date,
            routeDate: date,
          });
          const diaryEntries = Array.isArray(day.diary) ? day.diary : [];

          return (
            <>
              <div className="mb-6 flex items-center gap-4">
                {!isToday && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xl font-medium text-[var(--app-text)] transition hover:text-[var(--app-hint)]"
                    aria-label="Назад"
                  >
                    ←
                  </button>
                )}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-3xl font-semibold">Дневник</h1>
                      <p className="text-sm text-[var(--app-hint)]">
                        {formatDay(day.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(true)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl transition hover:bg-[var(--app-surface)]"
                        aria-label="Открыть календарь записей"
                      >
                        📅
                      </button>

                      {isToday && (
                        <button
                          type="button"
                          onClick={openNewEntry}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-xl text-white transition hover:bg-blue-600"
                          aria-label="Добавить новую запись"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Card className="rounded-[28px] p-6">
                {diaryEntries.length === 0 ? (
                  <div className="space-y-6">
                    <EmptyState
                      icon="📖"
                      title="За сегодняшний день ещё нет записей."
                      description="Запишите несколько мыслей, событий или благодарностей."
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diaryEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="w-full rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition hover:border-emerald-500"
                      >
                        <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--app-hint)]">
                          {formatEntryTime(entry.createdAt)}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-[var(--app-text)]">
                          {entry.content}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              <Modal
                open={isCalendarOpen}
                title="📅 Календарь записей"
                onClose={closeCalendar}
                footer={null}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.16em] text-[var(--app-hint)]">
                        Календарь записей
                      </p>
                      <h2 className="text-lg font-semibold text-[var(--app-text)]">
                        {new Date(
                          calendarYear,
                          calendarMonth - 1,
                        ).toLocaleDateString("ru-RU", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closeCalendar}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                      aria-label="Закрыть календарь записей"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => shiftCalendarMonth(-1)}
                      className="rounded-lg border border-[var(--app-border)] px-3 py-2"
                      aria-label="Предыдущий месяц"
                    >
                      ◀
                    </button>

                    <div className="text-sm font-semibold text-[var(--app-text)]">
                      {new Date(
                        calendarYear,
                        calendarMonth - 1,
                      ).toLocaleDateString("ru-RU", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => shiftCalendarMonth(1)}
                      className="rounded-lg border border-[var(--app-border)] px-3 py-2"
                      aria-label="Следующий месяц"
                    >
                      ▶
                    </button>
                  </div>

                  <Card>
                    <QueryState query={calendarQuery}>
                      {(data) => (
                        <CalendarGrid
                          days={data.days}
                          onSelect={handleCalendarSelect}
                        />
                      )}
                    </QueryState>
                  </Card>
                </div>
              </Modal>

              <AnimatePresence>
                {isDiaryOpen && (
                  <>
                    <motion.div
                      key="diary-backdrop"
                      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={closeEntry}
                    />

                    <motion.div
                      key="diary-sheet"
                      className="fixed inset-x-0 z-[70] mx-auto max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] bg-[var(--app-surface)] p-5 shadow-2xl"
                      style={{
                        bottom:
                          "calc(env(safe-area-inset-bottom, 0px) + 1rem + 72px + 16px)",
                      }}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.16em] text-[var(--app-hint)]">
                            Дневник
                          </p>
                          <h2 className="text-xl font-semibold text-[var(--app-text)]">
                            {editingEntry
                              ? "Редактировать запись"
                              : "Новая запись"}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={closeEntry}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                          aria-label="Закрыть"
                        >
                          ✕
                        </button>
                      </div>

                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={8}
                        placeholder="Что сегодня произошло? Чему вы научились? За что благодарны?"
                        className="mb-4 w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-hint)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      />

                      <Button
                        loading={diaryMutation.isPending}
                        onClick={onDiarySave}
                      >
                        {editingEntry
                          ? "Сохранить изменения"
                          : "Сохранить запись"}
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          );
        }}
      </QueryState>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import QueryState from "../components/ui/QueryState";
import { useDayByDate } from "../hooks/useDayByDate";
import { useBackButton } from "../hooks/useBackButton";
import { useDiary } from "../hooks/useDiary";
import type { DiaryEntry } from "../types/day";

function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const query = useDayByDate(date);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);

  console.log("DAY HISTORY PARAM DATE:", date);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [text, setText] = useState("");
  const diaryMutation = useDiary();

  useBackButton();

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
          console.log("DAY HISTORY DATA:", day);
          const diaryEntries = Array.isArray(day.diary) ? day.diary : [];

          return (
            <>
              <div className="mb-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-xl font-medium text-white transition hover:text-slate-300"
                  aria-label="Назад"
                >
                  ←
                </button>
                <div>
                  <h1 className="text-3xl font-semibold">Дневник</h1>
                  <p className="text-sm text-[var(--app-hint)]">
                    {console.log("DAY DATE BEFORE FORMAT:", day?.date)}
                    {formatDay(day.date)}
                  </p>
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
                        <p className="whitespace-pre-wrap text-sm text-white">
                          {entry.content}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

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
                          <h2 className="text-xl font-semibold">
                            {editingEntry
                              ? "Редактировать запись"
                              : "Новая запись"}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={closeEntry}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-slate-700 transition hover:bg-slate-100"
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
                        className="mb-4 w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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

              {!isDiaryOpen && (
                <button
                  type="button"
                  onClick={openNewEntry}
                  className="fixed left-1/2 bottom-28 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-full bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.25)] transition hover:shadow-[0_16px_45px_rgba(16,185,129,0.30)]"
                >
                  <span className="text-2xl">➕</span>
                  <span>Новая запись</span>
                </button>
              )}
            </>
          );
        }}
      </QueryState>
    </div>
  );
}

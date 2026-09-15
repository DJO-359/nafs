import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import QueryState from "../components/ui/QueryState";
import CalendarGrid from "../components/CalendarGrid";
import DiaryEntryActionsMenu from "../components/DiaryEntryActionsMenu";
import PinEmojiPickerModal from "../components/PinEmojiPickerModal";
import DiaryColorPickerModal from "../components/DiaryColorPickerModal";
import { updateDiary } from "../api/diary";
import { useCalendar } from "../hooks/useCalendar";
import { useDayByDate } from "../hooks/useDayByDate";
import { useBackButton } from "../hooks/useBackButton";
import { useDeleteDiary } from "../hooks/useDeleteDiary";
import { useDiary } from "../hooks/useDiary";
import { useDiaryHistory } from "../hooks/useDiaryHistory";
import { useInvalidateDayData } from "../hooks/useInvalidateDayData";
import { describeError } from "../lib/errors";
import { haptic } from "../lib/telegram";
import type { DiaryEntry } from "../types/day";

type CalendarNavigationState = {
  fromCalendar?: boolean;
  calendarYear?: number;
  calendarMonth?: number;
  openNewDiary?: boolean;
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

function formatDayLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
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

function adjustDate(date: string, delta: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const dt = new Date(year, month - 1, day);
  dt.setDate(dt.getDate() + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
}

function formatEntryTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPastelNoteBackground(color: string): string {
  const normalized = color?.toLowerCase();
  const pastelMap: Record<string, string> = {
    "#ffffff": "#ffffff",
    "#10b981": "#e8f7f0",
    "#14b8a6": "#dbf1ec",
    "#3b82f6": "#deecff",
    "#8b5cf6": "#eee3ff",
    "#f59e0b": "#fff3d1",
    "#ef4444": "#ffe4e4",
  };
  return pastelMap[normalized] ?? "#ffffff";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const diaryHistoryQuery = useDiaryHistory(isSearchOpen || isCalendarOpen);
  const [searchText, setSearchText] = useState("");
  const [swipedEntryId, setSwipedEntryId] = useState<string | null>(null);

  useBodyScrollLock(isCalendarOpen || isDiaryOpen || isSearchOpen);
  const [confirmDeleteEntry, setConfirmDeleteEntry] =
    useState<DiaryEntry | null>(null);
  const [pinPickerEntry, setPinPickerEntry] = useState<DiaryEntry | null>(null);
  const [colorPickerEntry, setColorPickerEntry] = useState<DiaryEntry | null>(
    null,
  );

  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [isSavingOnClose, setIsSavingOnClose] = useState(false);
  const diaryMutation = useDiary();
  const deleteDiaryMutation = useDeleteDiary();
  const invalidateDayData = useInvalidateDayData();

  const searchResults = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();
    if (!normalizedQuery || diaryHistoryQuery.isError) {
      return [];
    }

    const historyEntries = Array.isArray(diaryHistoryQuery.data)
      ? diaryHistoryQuery.data
      : [];

    return historyEntries.filter((entry) => {
      const content = entry.content.toLowerCase();
      if (content.includes(normalizedQuery)) return true;

      const pluralVariant = normalizedQuery.endsWith("а")
        ? normalizedQuery.slice(0, -1) + "ы"
        : normalizedQuery;
      return (
        pluralVariant !== normalizedQuery && content.includes(pluralVariant)
      );
    });
  }, [diaryHistoryQuery.data, diaryHistoryQuery.isError, searchText]);

  const updateEntryMutation = useMutation({
    mutationFn: ({
      entry,
      patch,
    }: {
      entry: DiaryEntry;
      patch: {
        color?: string;
        isPinned?: boolean;
        pinEmoji?: string | null;
      };
    }) =>
      updateDiary(entry.id, {
        content: entry.content,
        color: patch.color ?? entry.color,
        isPinned: patch.isPinned ?? entry.isPinned,
        pinEmoji:
          patch.pinEmoji !== undefined
            ? patch.pinEmoji
            : (entry.pinEmoji ?? null),
      }),
    onSuccess(updatedEntry) {
      queryClient.setQueryData(["day", date], (oldData) => {
        if (!oldData || typeof oldData !== "object") return oldData;
        return {
          ...oldData,
          diary: ((oldData as { diary?: DiaryEntry[] }).diary ?? []).map(
            (item) => (item.id === updatedEntry.id ? updatedEntry : item),
          ),
        };
      });
      invalidateDayData();
      haptic("success");
    },
    onError(error) {
      toast.error(`Не удалось обновить запись: ${describeError(error)}`);
      haptic("error");
    },
  });

  const openNewEntry = () => {
    setEditingEntry(null);
    setText("");
    setColor("#ffffff");
    setIsDiaryOpen(true);
  };

  const openEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setText(entry.content);
    setColor(entry.color ?? "#ffffff");
    setIsDiaryOpen(true);
  };

  const closeEntry = () => {
    setText("");
    setEditingEntry(null);
    setColor("#ffffff");
    setIsDiaryOpen(false);
  };

  useEffect(() => {
    if (state?.openNewDiary) {
      openNewEntry();
    }
  }, [state?.openNewDiary]);

  // Проверяет, есть ли что сохранять
  const hasChanges = (): boolean => {
    // Новая запись: есть текст
    if (!editingEntry && text.trim()) {
      return true;
    }
    // Редактирование: текст или цвет изменились
    if (editingEntry) {
      const textChanged = text !== editingEntry.content;
      const colorChanged = color !== (editingEntry.color ?? "#ffffff");
      return textChanged || colorChanged;
    }
    return false;
  };

  // Закрывает модалку с сохранением, если есть изменения
  const closeEntryWithSave = async () => {
    if (isSavingOnClose || diaryMutation.isPending) return; // Предотвращаем двойное сохранение

    if (!hasChanges()) {
      // Нет изменений - просто закрываем
      closeEntry();
      return;
    }

    // Есть изменения - сохраняем перед закрытием
    setIsSavingOnClose(true);
    try {
      await diaryMutation.mutateAsync({
        text: text.trim(),
        id: editingEntry?.id,
        color,
      });
      // Успешно сохранено - закрываем
      closeEntry();
    } catch {
      // Ошибка при сохранении - оставляем модалку открытой
      // Ошибка уже показана через toast в `useDiary` hook
    } finally {
      setIsSavingOnClose(false);
    }
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

  const handleTodayClose = () => {
    setIsCalendarOpen(false);
    navigate(`/day/${todayString()}`);
  };

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

  const handleBack = useCallback(async () => {
    // Если уже сохраняем - не обрабатываем back повторно
    if (isSavingOnClose) return;

    // Если модалка открыта, закрыть её с сохранением
    if (isDiaryOpen) {
      await closeEntryWithSave();
      return;
    }

    if (isFromCalendar) {
      setIsCalendarOpen(true);
      return;
    }
    navigate(-1);
  }, [isFromCalendar, navigate, isDiaryOpen, isSavingOnClose]);

  const handleClose = () => {
    navigate("/");
  };

  useBackButton(handleBack);

  const onDiarySave = async () => {
    if (!text.trim()) return;
    await diaryMutation.mutateAsync({
      text: text.trim(),
      id: editingEntry?.id,
      color,
    });
    setText("");
    setEditingEntry(null);
    setColor("#ffffff");
    setIsDiaryOpen(false);
    void queryClient.invalidateQueries({ queryKey: ["day", date] });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteEntry) return;
    deleteDiaryMutation.mutate(confirmDeleteEntry.id, {
      onSuccess: () => {
        setConfirmDeleteEntry(null);
        setSwipedEntryId(null);

        queryClient.setQueryData(["day", date], (oldData) => {
          if (!oldData || typeof oldData !== "object") return oldData;
          return {
            ...oldData,
            diary: ((oldData as any).diary ?? []).filter(
              (item: DiaryEntry) => item.id !== confirmDeleteEntry.id,
            ),
          };
        });

        invalidateDayData();
      },
    });
  };

  const handlePinAction = (entry: DiaryEntry) => {
    if (entry.isPinned) {
      void handleUnpinEntry(entry);
      return;
    }
    setPinPickerEntry(entry);
  };

  const handleColorAction = (entry: DiaryEntry) => {
    setColorPickerEntry(entry);
  };

  const handlePinEmojiSelect = async (emoji: string | null) => {
    if (!pinPickerEntry) return;
    await updateEntryMutation.mutateAsync({
      entry: pinPickerEntry,
      patch: {
        isPinned: true,
        pinEmoji: emoji,
      },
    });
    setPinPickerEntry(null);
  };

  const handleUnpinEntry = async (entry: DiaryEntry) => {
    await updateEntryMutation.mutateAsync({
      entry,
      patch: {
        isPinned: false,
        pinEmoji: null,
      },
    });
    if (pinPickerEntry?.id === entry.id) {
      setPinPickerEntry(null);
    }
  };

  const handleUnpin = async () => {
    if (!pinPickerEntry) return;
    await handleUnpinEntry(pinPickerEntry);
  };

  const handleColorSelect = async (color: string) => {
    if (!colorPickerEntry) return;
    await updateEntryMutation.mutateAsync({
      entry: colorPickerEntry,
      patch: { color },
    });
    setColorPickerEntry(null);
  };

  const handleShareEntry = async (entry: DiaryEntry) => {
    const shareText = entry.content.trim();
    if (!shareText) return;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Запись из дневника",
            text: shareText,
          });
        } catch (error) {
          if (
            (typeof DOMException !== "undefined" &&
              error instanceof DOMException &&
              error.name === "AbortError") ||
            (error as any)?.name === "AbortError"
          ) {
            return;
          }
          if ((error as any)?.name === "NotAllowedError") {
            return;
          }
          console.error("[Diary Share] navigator.share failed:", error);
          return;
        }
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        toast.success("Текст скопирован");
      } else {
        console.warn(
          "[Diary Share] No Web Share API and no Clipboard API available",
        );
      }
    } catch (error) {
      toast.error(`Не удалось поделиться: ${describeError(error)}`);
    }
  };

  return (
    <div className="pb-40">
      <QueryState query={query}>
        {(day) => {
          const diaryEntries = Array.isArray(day.diary) ? day.diary : [];

          return (
            <>
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`text-xl font-medium text-[var(--app-text)] transition hover:text-[var(--app-hint)] ${
                        isToday ? "invisible pointer-events-none" : ""
                      }`}
                      aria-label="Назад"
                      disabled={isToday}
                    >
                      ←
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h1 className="text-3xl font-semibold">Дневник</h1>
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

                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(true)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl transition hover:bg-[var(--app-surface)]"
                          aria-label="Поиск по дневнику"
                        >
                          🔍
                        </button>

                        <button
                          type="button"
                          onClick={handleClose}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                          aria-label="Выйти из дневника на главный экран"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mx-auto flex w-max items-center gap-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/day/${adjustDate(date || todayString(), -1)}`,
                        )
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] text-lg text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                      aria-label="Предыдущий день"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(true)}
                      className="rounded-full px-4 py-2 text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
                      aria-label="Выбрать дату"
                    >
                      {formatDayLabel(date || todayString())}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/day/${adjustDate(date || todayString(), 1)}`)
                      }
                      disabled={date === todayString() || date === ""}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] text-lg transition hover:bg-[var(--app-surface)] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Следующий день"
                    >
                      →
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-[var(--app-hint)]">
                    Нажмите на дату, чтобы выбрать другой день
                  </p>
                </div>
              </div>

              <Card className="rounded-[28px] p-6">
                {diaryEntries.length === 0 ? (
                  <div className="space-y-6">
                    <EmptyState
                      icon="📖"
                      title={
                        date === todayString()
                          ? "За сегодняшний день ещё нет записей."
                          : "За этот день нет записей."
                      }
                      description={
                        date === todayString()
                          ? "Запишите несколько мыслей, событий или благодарностей."
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diaryEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="relative overflow-hidden rounded-[24px]"
                      >
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteEntry(entry)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700"
                            aria-label="Удалить запись"
                          >
                            🗑
                          </button>
                        </div>

                        <motion.button
                          type="button"
                          onClick={() => openEntry(entry)}
                          className="relative w-full rounded-[24px] border border-[var(--app-border)] p-4 pt-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition hover:border-emerald-500"
                          style={{
                            backgroundColor: getPastelNoteBackground(
                              entry.color,
                            ),
                          }}
                          drag="x"
                          dragDirectionLock
                          dragConstraints={{ left: -100, right: 0 }}
                          dragElastic={0.1}
                          onDragStart={() => setSwipedEntryId(entry.id)}
                          onDragEnd={(_, info) => {
                            if (info.offset.x < -60) {
                              setSwipedEntryId(entry.id);
                              return;
                            }
                            setSwipedEntryId(null);
                          }}
                          animate={{ x: swipedEntryId === entry.id ? -100 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 35,
                          }}
                        >
                          {entry.isPinned && entry.pinEmoji && (
                            <div className="pointer-events-none absolute top-0 right-12 z-10 -translate-y-3">
                              <div className="relative w-12 h-16">
                                <svg
                                  viewBox="0 0 48 56"
                                  className="absolute inset-0 w-12 h-16 text-emerald-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  focusable="false"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M0 0 H48 V40 L24 48 L0 40 Z"
                                    fill="currentColor"
                                  />
                                </svg>
                                <span
                                  aria-label="Закреплённая запись"
                                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl leading-none text-white"
                                >
                                  {entry.pinEmoji}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="mb-3 flex items-start justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="text-xs uppercase tracking-[0.16em] text-[var(--app-hint)]">
                                {formatEntryTime(entry.createdAt)}
                              </div>
                            </div>

                            <DiaryEntryActionsMenu
                              isPinned={Boolean(entry.isPinned)}
                              onPin={() => handlePinAction(entry)}
                              onChangeColor={() => handleColorAction(entry)}
                              onShare={() => void handleShareEntry(entry)}
                              onDelete={() => setConfirmDeleteEntry(entry)}
                            />
                          </div>
                          <p className="whitespace-pre-wrap text-sm text-black">
                            {entry.content}
                          </p>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {!isDiaryOpen && (
                <button
                  type="button"
                  onClick={openNewEntry}
                  className="fixed bottom-24 right-6 z-[80] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.34)] transition active:scale-95 hover:bg-blue-600 focus:outline-none"
                  aria-label="Добавить новую запись"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center text-[30px] font-semibold leading-none">
                    +
                  </span>
                </button>
              )}

              {/* Модалка календаря – скрываем кнопку "Отмена" */}
              <Modal
                open={isCalendarOpen}
                title="📅 Календарь записей"
                onClose={closeCalendar}
                footer={null}
                showCancel={false}
                headerAction={
                  <button
                    type="button"
                    onClick={handleTodayClose}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                    aria-label="Закрыть календарь и перейти на сегодняшний дневник"
                  >
                    ✕
                  </button>
                }
              >
                <div className="space-y-4">
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
                          diaryDates={
                            new Set(
                              Array.isArray(diaryHistoryQuery.data)
                                ? diaryHistoryQuery.data.map(
                                    (entry) => entry.date,
                                  )
                                : [],
                            )
                          }
                        />
                      )}
                    </QueryState>
                  </Card>
                </div>
              </Modal>

              <Modal
                open={isSearchOpen}
                title="Поиск по дневнику"
                onClose={() => {
                  setIsSearchOpen(false);
                  setSearchText("");
                }}
                footer={null}
                showCancel={false}
                headerAction={
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchText("");
                    }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                    aria-label="Закрыть поиск"
                  >
                    ✕
                  </button>
                }
              >
                <div className="space-y-4">
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="Введите текст записи"
                    autoFocus
                  />

                  {searchText.trim() === "" ? (
                    <div className="text-sm text-[var(--app-hint)]">
                      Введите текст для поиска по всем записям дневника.
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-sm font-medium text-[var(--app-text)]">
                      Записей не найдено
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3"
                        >
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-hint)]">
                            {formatDay(entry.date)}
                          </div>
                          <p className="whitespace-pre-wrap text-sm text-[var(--app-text)]">
                            {entry.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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
                      onClick={closeEntryWithSave}
                    />
                    <motion.div
                      key="diary-sheet"
                      className="fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-3xl overflow-hidden rounded-t-[28px] bg-[var(--app-surface)] shadow-2xl"
                      style={{ maxHeight: "100dvh" }}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 28,
                      }}
                    >
                      <div className="flex h-full flex-col overflow-hidden">
                        <div className="p-5">
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
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={onDiarySave}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-semibold text-white transition hover:bg-emerald-600"
                                aria-label={
                                  editingEntry
                                    ? "Сохранить изменения"
                                    : "Сохранить запись"
                                }
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={closeEntryWithSave}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-bg)] text-xl text-[var(--app-text)] transition hover:bg-[var(--app-surface)]"
                                aria-label="Закрыть"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="min-h-0 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                          <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={8}
                            placeholder="Что сегодня произошло? Чему вы научились? За что благодарны?"
                            className="w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm text-[var(--app-text)] placeholder:text-[var(--app-hint)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            style={{ borderColor: color }}
                          />
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {[
                                "#ffffff",
                                "#10b981",
                                "#3b82f6",
                                "#8b5cf6",
                                "#f59e0b",
                                "#ef4444",
                              ].map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => setColor(item)}
                                  className={`h-10 w-10 rounded-full border transition focus:outline-none ${
                                    color === item
                                      ? "border-white ring-2 ring-offset-2 ring-offset-[var(--app-surface)]"
                                      : "border-[var(--app-border)]"
                                  }`}
                                  style={{ backgroundColor: item }}
                                  aria-label={`Выбрать цвет ${item}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <PinEmojiPickerModal
                open={Boolean(pinPickerEntry)}
                isPinned={Boolean(pinPickerEntry?.isPinned)}
                onClose={() => setPinPickerEntry(null)}
                onSelect={handlePinEmojiSelect}
                onUnpin={handleUnpin}
              />

              <DiaryColorPickerModal
                open={Boolean(colorPickerEntry)}
                selectedColor={colorPickerEntry?.color ?? "#ffffff"}
                onClose={() => setColorPickerEntry(null)}
                onSelect={handleColorSelect}
              />

              <ConfirmModal
                open={Boolean(confirmDeleteEntry)}
                title="Удалить запись"
                description="Вы уверены, что хотите удалить?"
                confirmText="Удалить"
                onClose={() => {
                  setConfirmDeleteEntry(null);
                  setSwipedEntryId(null);
                }}
                onConfirm={handleDeleteConfirm}
              />
            </>
          );
        }}
      </QueryState>
    </div>
  );
}

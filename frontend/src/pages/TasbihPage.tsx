import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import CreateTasbihModal from "../components/CreateTasbihModal";
import EditTasbihModal from "../components/EditTasbihModal";
import TasbihActionsMenu from "../components/TasbihActionsMenu";
import {
  useTasbih,
  useIncrementTasbih,
  useResetTasbih,
  useDeleteTasbih,
} from "../hooks/useTasbih";
import { useBackButton } from "../hooks/useBackButton";
import type { TasbihCounter } from "../api/tasbih.api";

export default function TasbihPage() {
  const navigate = useNavigate();
  const { data: counters = [], isLoading, isError } = useTasbih();
  const incrementMutation = useIncrementTasbih();
  const resetMutation = useResetTasbih();
  const deleteMutation = useDeleteTasbih();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 40;

  useBackButton("/");

  // Restore selected index from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasbih_selected_index");
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < counters.length) {
        setSelectedIndex(idx);
      }
    }
  }, [counters.length]);

  // Save selected index to localStorage
  useEffect(() => {
    localStorage.setItem("tasbih_selected_index", String(selectedIndex));
  }, [selectedIndex]);

  // Reset selected index if it's out of bounds
  useEffect(() => {
    if (selectedIndex >= counters.length && counters.length > 0) {
      setSelectedIndex(Math.max(0, counters.length - 1));
    }
  }, [counters.length, selectedIndex]);

  const selectedCounter: TasbihCounter | null =
    counters.length > 0 ? counters[selectedIndex] : null;

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < counters.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleIncrement = () => {
    if (selectedCounter) {
      incrementMutation.mutate(selectedCounter.id);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeStartRef.current) return;

    const deltaX = event.clientX - swipeStartRef.current.x;
    const deltaY = event.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) >= SWIPE_THRESHOLD
    ) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrevious();
      }
      return;
    }

    if (Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12) {
      handleIncrement();
    }
  };

  const handlePointerLeave = () => {
    swipeStartRef.current = null;
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmReset = () => {
    if (selectedCounter) {
      resetMutation.mutate(selectedCounter.id);
    }
    setIsResetConfirmOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCounter) {
      deleteMutation.mutate(selectedCounter.id);

      // After deletion, adjust the selected index
      // If the deleted counter was at the current index, adjust the index
      const currentIdx = selectedIndex;
      const newLength = counters.length - 1;

      if (newLength === 0) {
        // No counters left, will show empty state
        setSelectedIndex(0);
      } else if (currentIdx >= newLength) {
        // If we were at the last position, move to the new last position
        setSelectedIndex(newLength - 1);
      }
      // Otherwise, keep the same index (next counter shifts into position)
    }
    setIsDeleteConfirmOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--app-hint)]">Загрузка счётчиков...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--app-text)]">⚠️ Ошибка загрузки</p>
          <p className="mt-2 text-sm text-[var(--app-hint)]">
            Не удалось загрузить счётчики. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (counters.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 pb-2 pt-4">
          <h1 className="text-lg font-semibold text-[var(--app-text)]">
            📿 Азкары
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface)] text-2xl leading-none text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-border)]"
              aria-label="Создать счётчик"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface)] text-xl leading-none text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-border)]"
              aria-label="Вернуться на главный экран"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-6xl">📿</p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--app-text)]">
              Азкары
            </h2>
            <p className="mt-2 text-[var(--app-hint)]">
              Создайте свой первый счётчик
            </p>
            <Button className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
              + Создать счётчик
            </Button>
          </div>
        </div>

        <CreateTasbihModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  // Main screen
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📿</span>
          <h1 className="text-lg font-semibold text-[var(--app-text)]">
            Азкары
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface)] text-2xl leading-none text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-border)]"
            aria-label="Создать счётчик"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface)] text-xl leading-none text-[var(--app-text)] shadow-sm transition hover:bg-[var(--app-border)]"
            aria-label="Вернуться на главный экран"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Content - Counter Display */}
      <main className="flex-1 px-4 pb-4 pt-3">
        <div
          className="flex h-full w-full flex-col items-center justify-start pt-2"
          style={{ touchAction: "pan-y" }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        >
          {/* Counter Name with Actions Menu */}
          <div
            className="flex w-full items-center justify-center gap-3"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex-1 text-center">
              <p className="text-sm text-[var(--app-hint)]">Текущий счётчик</p>
              <h2 className="mt-2 text-3xl font-bold text-[var(--app-text)] line-clamp-2">
                {selectedCounter?.name}
              </h2>
            </div>
            <TasbihActionsMenu
              onEdit={() => setIsEditModalOpen(true)}
              onReset={handleReset}
              onDelete={handleDelete}
            />
          </div>

          {/* Large Count Display */}
          <div className="mt-8 text-center">
            <p className="text-7xl font-bold text-emerald-600">
              {selectedCounter?.count}
            </p>
            <p className="mt-2 text-xl text-[var(--app-hint)]">
              {selectedCounter?.isInfinite
                ? "/ ∞"
                : `/ ${selectedCounter?.target}`}
            </p>
          </div>

          {/* Progress indicator for non-infinite counters */}
          {selectedCounter && !selectedCounter.isInfinite && (
            <div className="mt-5 w-48">
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--app-border)]">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedCounter.count / (selectedCounter.target || 1)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-center text-xs text-[var(--app-hint)]">
                {selectedCounter.count} / {selectedCounter.target}
              </p>
            </div>
          )}

          {counters.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {counters.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedIndex(idx);
                  }}
                  className={`h-2.5 rounded-full transition ${
                    idx === selectedIndex
                      ? "w-6 bg-emerald-600"
                      : "w-2.5 bg-[var(--app-border)]"
                  }`}
                  aria-label={`Переключиться на счётчик ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <CreateTasbihModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditTasbihModal
        open={isEditModalOpen}
        counter={selectedCounter}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Reset Confirm Modal */}
      <ConfirmModal
        open={isResetConfirmOpen}
        title="Сбросить счётчик?"
        description="Текущий прогресс будет сброшен до 0."
        confirmText="Сбросить"
        onConfirm={confirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Удалить счётчик?"
        description={`Счётчик «${selectedCounter?.name}» будет удалён без возможности восстановления.`}
        confirmText="Удалить"
        onConfirm={confirmDelete}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
}

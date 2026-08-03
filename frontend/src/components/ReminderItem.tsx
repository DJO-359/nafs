import { useState } from "react";
import { motion } from "motion/react";

import Button from "./ui/Button";
import ConfirmModal from "./ui/ConfirmModal";
import type { Reminder } from "../api/reminder.api";

interface Props {
  reminder: Reminder;
  onComplete?: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  completing?: boolean;
  deleting?: boolean;
}

const REPEAT_LABELS: Record<string, string> = {
  daily: "каждый день",
  weekly: "по дням недели",
  monthly: "каждый месяц",
  interval: "по интервалу",
  custom: "по интервалу",
};

export default function ReminderItem({
  reminder,
  onComplete,
  onDelete,
  onEdit,
  completing = false,
  deleting = false,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const time = new Date(reminder.remindAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const repeatLabel = REPEAT_LABELS[reminder.repeatType];

  return (
    <>
      <motion.li
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className={`rounded-xl border border-[var(--app-border)] p-3 shadow-sm transition ${
          reminder.completed
            ? "bg-[var(--app-bg)] opacity-70"
            : "bg-[var(--app-surface)]"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div
              className={
                reminder.completed
                  ? "truncate text-[var(--app-hint)] line-through"
                  : "truncate font-medium"
              }
            >
              {reminder.title}
            </div>

            <div className="text-sm text-[var(--app-hint)]">
              {time}
              {repeatLabel ? ` · ${repeatLabel}` : ""}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            {onEdit && (
              <Button
                className="w-auto bg-blue-600 px-3 hover:bg-blue-700"
                onClick={onEdit}
                disabled={completing || deleting}
                aria-label="Редактировать"
              >
                ✏️
              </Button>
            )}

            {!reminder.completed && onComplete && (
              <Button
                className="w-auto px-3"
                onClick={onComplete}
                loading={completing}
                disabled={completing || deleting}
                aria-label="Выполнено"
              >
                ✓
              </Button>
            )}

            <Button
              className="w-auto bg-red-600 px-3 hover:bg-red-700"
              onClick={() => setConfirmOpen(true)}
              loading={deleting}
              disabled={completing || deleting}
              aria-label="Удалить"
            >
              🗑
            </Button>
          </div>
        </div>
      </motion.li>

      <ConfirmModal
        open={confirmOpen}
        title="Удалить напоминание?"
        description={`Вы уверены, что хотите удалить «${reminder.title}»?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
      />
    </>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import Button from "./ui/Button";
import ConfirmModal from "./ui/ConfirmModal";

interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  completed: boolean;
}

interface Props {
  reminder: Reminder;
  onComplete?: () => void;
  onDelete: () => void;
  onEdit?: () => void; // просто сигнал, без данных
  completing?: boolean;
  deleting?: boolean;
}

export default function ReminderItem({
  reminder,
  onComplete,
  onDelete,
  onEdit,
  completing = false,
  deleting = false,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <motion.li
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className={`rounded-xl border p-3 shadow-sm transition ${
          reminder.completed ? "border-gray-200 bg-gray-50" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className={
                reminder.completed
                  ? "line-through text-gray-400"
                  : "font-medium"
              }
            >
              {reminder.title}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(reminder.remindAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="w-auto bg-blue-600 px-3 hover:bg-blue-700"
              onClick={onEdit}
              disabled={completing || deleting}
            >
              ✏️
            </Button>

            {!reminder.completed && (
              <Button
                className="w-auto px-3"
                onClick={onComplete}
                loading={completing}
                disabled={completing || deleting}
              >
                ✓
              </Button>
            )}

            <Button
              className="w-auto bg-red-600 px-3 hover:bg-red-700"
              onClick={() => setConfirmOpen(true)}
              loading={deleting}
              disabled={completing || deleting}
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
        onConfirm={onDelete}
      />
    </>
  );
}

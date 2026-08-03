import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import Card from "./ui/Card";
import ReminderSection from "./ReminderSection";
import ReminderForm from "./reminders/ReminderForm";
import { useCompleteReminder } from "../hooks/useCompleteReminder";
import { useDeleteReminder } from "../hooks/useDeleteReminder";
import { useUpdateReminder } from "../hooks/useUpdateReminder";
import type { CreateReminderDto, Reminder } from "../api/reminder.api";
import type { GroupedReminders } from "../types/day";

interface Props {
  reminders: GroupedReminders;
  onCreate: (dto: CreateReminderDto) => Promise<void>;
}

function formatGroupDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

export default function ReminderList({ reminders, onCreate }: Props) {
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const completeMutation = useCompleteReminder();
  const deleteMutation = useDeleteReminder();
  const updateMutation = useUpdateReminder();

  const showForm = isFormOpen || editing !== null;

  /** Закрывает форму полностью — и создание, и редактирование. */
  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
  }

  function startEditing(reminder: Reminder) {
    setEditing(reminder);
    setIsFormOpen(true);
  }

  async function handleSubmit(dto: CreateReminderDto) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, dto });
    } else {
      await onCreate(dto);
    }

    closeForm();
  }

  const isEmpty =
    !reminders.today.length &&
    !reminders.tomorrow.length &&
    !reminders.upcoming.length;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">⏰ Напоминания</h2>

        <button
          type="button"
          onClick={() => (showForm ? closeForm() : setIsFormOpen(true))}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          aria-label={showForm ? "Закрыть форму" : "Открыть форму"}
        >
          {showForm ? "✕" : "+"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="reminder-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* key сбрасывает состояние формы при смене режима —
                вместо синхронизации полей через useEffect */}
            <ReminderForm
              key={editing?.id ?? "new"}
              editing={editing}
              submitting={updateMutation.isPending}
              onSubmit={(dto) => void handleSubmit(dto)}
              onCancel={closeForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isEmpty && (
        <p className="text-[var(--app-hint)]">Пока нет напоминаний</p>
      )}

      <ReminderSection
        title="Сегодня"
        items={reminders.today}
        completingId={
          completeMutation.isPending ? completeMutation.variables : undefined
        }
        deletingId={
          deleteMutation.isPending ? deleteMutation.variables : undefined
        }
        onComplete={(id) => completeMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={startEditing}
      />

      <ReminderSection
        title="Завтра"
        items={reminders.tomorrow}
        completingId={
          completeMutation.isPending ? completeMutation.variables : undefined
        }
        deletingId={
          deleteMutation.isPending ? deleteMutation.variables : undefined
        }
        onComplete={(id) => completeMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={startEditing}
      />

      {reminders.upcoming.map((group) => (
        <ReminderSection
          key={group.date}
          title={formatGroupDate(group.date)}
          items={group.items}
          completingId={
            completeMutation.isPending ? completeMutation.variables : undefined
          }
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables : undefined
          }
          onComplete={(id) => completeMutation.mutate(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onEdit={startEditing}
        />
      ))}
    </Card>
  );
}

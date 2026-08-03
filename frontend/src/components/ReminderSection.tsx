import { AnimatePresence } from "motion/react";

import ReminderItem from "./ReminderItem";
import type { Reminder } from "../api/reminder.api";

interface Props {
  title: string;
  items: Reminder[];
  completingId?: string;
  deletingId?: string;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
}

/**
 * Одна группа напоминаний (сегодня / завтра / конкретная дата).
 * Раньше эта разметка была скопирована в ReminderList трижды.
 */
export default function ReminderSection({
  title,
  items,
  completingId,
  deletingId,
  onComplete,
  onDelete,
  onEdit,
}: Props) {
  if (!items.length) {
    return null;
  }

  const active = items.filter((item) => !item.completed);
  const completed = items.filter((item) => item.completed);

  return (
    <section className="mt-5 first:mt-0">
      <h3 className="mb-2 font-semibold">📅 {title}</h3>

      {active.length > 0 && (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {active.map((item) => (
              <ReminderItem
                key={item.id}
                reminder={item}
                onComplete={() => onComplete(item.id)}
                onDelete={() => onDelete(item.id)}
                onEdit={() => onEdit(item)}
                completing={completingId === item.id}
                deleting={deletingId === item.id}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {completed.length > 0 && (
        <>
          <h4 className="mt-4 text-sm font-semibold text-[var(--app-hint)]">
            Выполнено ({completed.length})
          </h4>

          <ul className="mt-2 space-y-2">
            <AnimatePresence>
              {completed.map((item) => (
                <ReminderItem
                  key={item.id}
                  reminder={item}
                  onDelete={() => onDelete(item.id)}
                  onEdit={() => onEdit(item)}
                  deleting={deletingId === item.id}
                />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </section>
  );
}

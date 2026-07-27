import { AnimatePresence } from "motion/react";

import ReminderItem from "./ReminderItem";

interface Reminder {
  id: string;
  title: string;
  remindAt: string;
  completed: boolean;
}

interface Props {
  title: string;

  active: Reminder[];

  completed: Reminder[];

  onComplete: (id: string) => void;

  onDelete: (id: string) => void;
}

export default function ReminderSection({
  title,
  active,
  completed,
  onComplete,
  onDelete,
}: Props) {
  if (active.length === 0 && completed.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="mt-5 mb-2 text-lg font-semibold">📅 {title}</h3>

      {active.length > 0 && (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {active.map((item) => (
              <ReminderItem
                key={item.id}
                reminder={item}
                onComplete={() => onComplete(item.id)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {completed.length > 0 && (
        <>
          <div className="mt-3 mb-2 text-sm text-gray-500">Выполнено</div>

          <ul className="space-y-2">
            <AnimatePresence>
              {completed.map((item) => (
                <ReminderItem
                  key={item.id}
                  reminder={item}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </>
  );
}

import Modal from "../ui/Modal";
import type { Habit } from "../../api/habit.api";
import { getHabitMissLimit } from "../../lib/habit-progress";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LIMIT_EXAMPLES = [30, 60, 90, 180, 365];
const EXAMPLE_START_DATE = "2025-01-01";

function getDateAfterDays(days: number): string {
  const date = new Date(`${EXAMPLE_START_DATE}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days - 1);
  return date.toISOString().slice(0, 10);
}

function getLimitForDays(days: number): number {
  return getHabitMissLimit({
    startDate: EXAMPLE_START_DATE,
    endDate: getDateAfterDays(days),
  } as Habit);
}

export default function HabitMissesInfoModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      title="! Пропуски"
      onClose={onClose}
      showCancel={false}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-(--app-border) px-4 py-2 text-sm font-medium text-(--app-text) transition hover:bg-(--app-bg)"
        >
          Понятно
        </button>
      }
    >
      <div className="space-y-3 text-sm text-(--app-hint)">
        <p className="font-medium text-(--app-text)">
          Красные точки показывают реальные пропущенные дни.
        </p>
        <div className="space-y-1">
          <p>🔴 1 точка = 1 пропущенный день</p>
          <p>🔴 🔴 2 точки = 2 пропущенных дня</p>
          <p>Каждый день считается отдельно, даже если пропуски не подряд.</p>
        </div>
        <div className="space-y-1">
          {LIMIT_EXAMPLES.map((days) => (
            <p key={days}>
              {days} дней = {getLimitForDays(days)} пропуска
              {getLimitForDays(days) === 1 ? "" : "ов"}
            </p>
          ))}
        </div>
        <p>
          После превышения лимита привычка приостанавливается. После нажатия
          «Активировать» следующий новый пропуск приведёт к безвозвратному
          удалению привычки.
        </p>
      </div>
    </Modal>
  );
}

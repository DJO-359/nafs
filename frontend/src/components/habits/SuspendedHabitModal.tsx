import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SuspendedHabitModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      title="Привычка приостановлена"
      onClose={onClose}
      showCancel={false}
      footer={<Button onClick={onClose}>Понятно</Button>}
    >
      <div className="space-y-3 text-(--app-hint)">
        <p>Ты пропустил 3 дня подряд.</p>
        <p>Вернись завтра, чтобы продолжить.</p>
        <p className="font-medium text-amber-700">
          ⚠️ Следующий пропуск — привычка будет удалена без возможности
          восстановления.
        </p>
      </div>
    </Modal>
  );
}

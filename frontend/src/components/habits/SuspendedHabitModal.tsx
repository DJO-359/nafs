import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function SuspendedHabitModal({
  open,
  onClose,
  onContinue,
}: Props) {
  return (
    <Modal
      open={open}
      title="Привычка приостановлена"
      onClose={onClose}
      showCancel={false}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-(--app-border) px-4 py-2 text-sm text-(--app-hint) transition hover:bg-(--app-bg)"
          >
            Отмена
          </button>
          <Button onClick={onContinue} className="w-auto">
            Продолжить
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-(--app-hint)">
        <p>Вы превысили допустимое количество пропусков.</p>
        <p className="font-medium text-amber-700">
          Если вы пропустите ещё один день, привычка будет удалена безвозвратно.
        </p>
      </div>
    </Modal>
  );
}

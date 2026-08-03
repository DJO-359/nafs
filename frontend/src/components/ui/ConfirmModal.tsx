import Button from "./Button";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Удалить",
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-[var(--app-hint)]">{description}</p>
    </Modal>
  );
}

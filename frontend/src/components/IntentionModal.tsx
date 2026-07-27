import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

interface Props {
  open: boolean;
  initialValue?: string;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}

export default function IntentionModal({
  open,
  initialValue = "",
  onClose,
  onSave,
}: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(initialValue);
  }, [initialValue, open]);

  async function handleSave() {
    if (!text.trim()) return;

    await onSave(text);

    onClose();
  }

  return (
    <Modal
      open={open}
      title="🧭 Намерение дня"
      onClose={onClose}
      footer={<Button onClick={handleSave}>Сохранить</Button>}
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите намерение..."
      />
    </Modal>
  );
}

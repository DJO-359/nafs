import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import IntentionModal from "./IntentionModal"; // Шаг 1

interface Props {
  intention: {
    text: string;
    completed: boolean;
  } | null;
  onCreate: (text: string) => Promise<void>;
  onComplete: () => Promise<void>;
}

export default function IntentionCard({
  intention,
  onCreate,
  onComplete,
}: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Шаг 2

  async function handleSave() {
    if (!text.trim()) return;

    setLoading(true);

    try {
      await onCreate(text);
      setText("");
    } finally {
      setLoading(false);
    }
  }

  // Шаг 3: функция handleEdit удалена

  if (!intention) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-semibold">🧭 Намерение</h2>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите намерение..."
          className="mb-3"
        />

        <Button onClick={handleSave} loading={loading}>
          Сохранить
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">🧭 Намерение</h2>

        <p className="mb-4">{intention.text}</p>

        <div className="flex gap-2">
          {/* Шаг 4: кнопка открывает модалку */}
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ✏️ Изменить
          </Button>

          {!intention.completed ? (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              ✓ Выполнено
            </Button>
          ) : (
            <div className="flex items-center font-medium text-green-600">
              ✅ Выполнено
            </div>
          )}
        </div>
      </Card>

      {/* Шаг 5: модальное окно */}
      <IntentionModal
        open={modalOpen}
        initialValue={intention.text}
        onClose={() => setModalOpen(false)}
        onSave={async (text) => {
          await onCreate(text);
        }}
      />
    </>
  );
}

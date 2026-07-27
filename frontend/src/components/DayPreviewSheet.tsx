import Card from "./ui/Card";
import Button from "./ui/Button";

interface Props {
  open: boolean;
  loading: boolean;
  day: any;
  onClose(): void;
  onOpen(): void;
}

export default function DayPreviewSheet({
  open,
  loading,
  day,
  onClose,
  onOpen,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />

        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold">📅 {day?.date}</h2>

            <Card className="mb-3">
              <h3 className="font-semibold">🎯 Намерение</h3>

              <p>{day?.intention?.text ?? "Нет"}</p>
            </Card>

            <Card className="mb-3">
              <h3 className="font-semibold">📖 Дневник</h3>

              <p>{day?.diary?.content ?? "Нет записи"}</p>
            </Card>

            <Card>
              <h3 className="font-semibold">⏰ Напоминания</h3>

              <p>{day?.reminders?.length ?? 0}</p>
            </Card>

            <div className="mt-5 flex gap-3">
              <Button onClick={onOpen}>Открыть день</Button>

              <Button variant="secondary" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

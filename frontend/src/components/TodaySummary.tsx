import Card from "./ui/Card";

interface Props {
  remindersLeft: number;
  diary: boolean;
  intentionCompleted: boolean;
}

export default function TodaySummary({
  remindersLeft,
  diary,
  intentionCompleted,
}: Props) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Сегодня</h2>

      <div className="space-y-3">
        <div>🎯 Намерение {intentionCompleted ? "✅" : "⭕"}</div>

        <div>⏰ Осталось: {remindersLeft}</div>

        <div>📖 Дневник {diary ? "✅" : "⭕"}</div>
      </div>
    </Card>
  );
}

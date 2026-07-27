import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import SectionTitle from "./ui/SectionTitle"; // импорт
import EmptyState from "./ui/EmptyState"; // импорт
import { useDiary } from "../hooks/useDiary";

interface Props {
  diary: {
    content: string;
  } | null;
}

export default function DiaryCard({ diary }: Props) {
  const [text, setText] = useState(diary?.content ?? "");
  const mutation = useDiary();

  return (
    <Card>
      <SectionTitle icon="📖" title="Дневник" />

      {!diary && (
        <EmptyState
          icon="📖"
          title="Сегодня ещё нет записи"
          description="Запишите несколько мыслей, выводов или благодарностей за сегодняшний день."
        />
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Что сегодня произошло? Чему вы научились? За что благодарны?"
        className="mb-4 w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />

      <Button
        loading={mutation.isPending}
        onClick={() => mutation.mutate(text)}
      >
        💾 Сохранить
      </Button>
    </Card>
  );
}

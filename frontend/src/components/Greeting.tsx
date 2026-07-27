import { formatDate } from "../utils/formatDate";

interface Props {
  date: string;
}

export default function Greeting({ date }: Props) {
  const hour = new Date().getHours();

  let greeting = "Добрый день";

  if (hour < 6) {
    greeting = "Доброй ночи";
  } else if (hour < 12) {
    greeting = "Доброе утро";
  } else if (hour < 18) {
    greeting = "Добрый день";
  } else {
    greeting = "Добрый вечер";
  }

  return (
    <div className="mb-6 rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">{greeting}</p>

      <h1 className="mt-1 text-3xl font-bold">🌅 Сегодня</h1>

      <p className="mt-2 text-gray-500 capitalize">{formatDate(date)}</p>
    </div>
  );
}

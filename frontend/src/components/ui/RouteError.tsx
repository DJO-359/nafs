import { useNavigate, useRouteError } from "react-router-dom";

import ScreenMessage from "./ScreenMessage";

interface Props {
  notFound?: boolean;
}

/** Экран ошибки маршрута — с возможностью вернуться на главную. */
export default function RouteError({ notFound = false }: Props) {
  const error = useRouteError();
  const navigate = useNavigate();

  if (!notFound) {
    console.error("Ошибка маршрута", error);
  }

  return (
    <ScreenMessage
      icon={notFound ? "🧭" : "😕"}
      title={notFound ? "Страница не найдена" : "Что-то пошло не так"}
      description={
        notFound
          ? "Похоже, такой страницы нет."
          : "Не удалось отобразить этот экран."
      }
      actionLabel="На главную"
      onAction={() => navigate("/")}
    />
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./app/App";
import { Providers } from "./app/providers";
import { initTelegram } from "./lib/telegram";

// ready() и expand() должны вызываться как можно раньше: без них Telegram
// держит собственный лоадер поверх приложения и не разворачивает окно
initTelegram();

const container = document.getElementById("root");

if (!container) {
  throw new Error("Не найден элемент #root");
}

// Дерево рендерится всегда. Авторизация живёт внутри AuthGate,
// поэтому сетевая ошибка даёт экран с объяснением, а не белый экран.
createRoot(container).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);

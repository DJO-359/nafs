# Nafs

Telegram Mini App для ежедневных практик: намерение дня (ният), дневник,
привычки, напоминания с повторами, календарь и статистика.

- **Backend** — NestJS 11, Sequelize, PostgreSQL (Neon), Telegram-бот
- **Frontend** — React 19, Vite, TanStack Query, Tailwind 4
- **Прод** — https://nafs-iota.vercel.app

---

## Быстрый старт

### 1. Backend

```bash
cd backend
npm ci
cp .env.example .env      # заполните значения
npm run db:migrate        # накатить схему
npm run start:dev
```

Приложение не стартует, если переменная окружения отсутствует или не проходит
валидацию — список и требования описаны в `src/config/env.validation.ts`.

Сгенерировать `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Важно локально:** держите `TELEGRAM_ENABLED=false`. Иначе второй polling
конкурирует с продовым ботом и Telegram отвечает `409 Conflict`.

### 2. Frontend

```bash
cd frontend
npm ci
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev
```

---

## Как работает вход

Личность пользователя берётся **только** из подписанной строки
`window.Telegram.WebApp.initData`. Бэкенд проверяет её по алгоритму Telegram:
`secret_key = HMAC_SHA256(bot_token, "WebAppData")`, сверка `hash` через
`timingSafeEqual`, проверка `auth_date` на устаревание.

Телу запроса не доверяется ничего: подставить чужой `telegramId` невозможно.

**Разработка вне Telegram.** Если задан `DEV_TELEGRAM_ID` и `NODE_ENV`
не равен `production`, доступен `POST /auth/dev` — вход без Telegram под
указанным идентификатором. В production маршрут отвечает 404.

---

## Часовые пояса

Все вычисления «сегодня», границ суток, серии дней и повторов идут через
`src/common/utils/timezone.util.ts` и зону из `User.timezone`, которую клиент
присылает при входе (`Intl.DateTimeFormat().resolvedOptions().timeZone`).

Прямые `toISOString().slice(0, 10)` и `setHours(0,0,0,0)` в бизнес-логике
использовать нельзя: они дают разный день для пользователя и для сервера.

---

## Схема базы данных

Схема управляется миграциями:

```bash
npm run db:migrate          # накатить
npm run db:migrate:status   # что применено
npm run db:migrate:undo     # откатить последнюю
```

`DB_SYNC` по умолчанию выключен и предназначен только для локальной песочницы:
`sequelize.sync()` умеет молча терять данные при изменении типа колонки.

---

## Команды

| Пакет    | Команда            | Что делает                       |
| -------- | ------------------ | -------------------------------- |
| backend  | `npm run start:dev`| Запуск с автоперезагрузкой       |
| backend  | `npm test`         | Модульные тесты                  |
| backend  | `npm run lint`     | ESLint + Prettier                |
| backend  | `npm run build`    | Сборка в `dist/`                 |
| backend  | `npm run db:migrate` | Миграции БД                    |
| frontend | `npm run dev`      | Vite dev-сервер                  |
| frontend | `npm run build`    | Прод-сборка                      |
| frontend | `npm run lint`     | ESLint                           |

---

## Структура

```
backend/src/
  auth/          вход через initData, JWT, guard
  users/         профиль, часовой пояс, отметка блокировки бота
  day/           агрегатор экрана дня
  intention/     намерение дня
  diary/         дневник
  habits/        привычки и отметки выполнения
  reminders/     напоминания, правила повтора, планировщик
  calendar/      данные календаря за месяц
  stats/         счётчики и серия дней
  telegram/      бот: команды, кнопки, отправка сообщений
  common/        утилиты дат, фильтр ошибок, интерцептор логов
  config/        валидация переменных окружения
  health/        GET /health для платформы деплоя

frontend/src/
  app/           роутер, провайдеры, AuthGate
  api/           HTTP-клиент и методы
  hooks/         запросы и мутации TanStack Query
  components/    UI
  pages/         экраны
  lib/           обёртка Telegram WebApp, обработка ошибок
```

---

## Эндпоинты

| Метод  | Путь                        | Назначение                        |
| ------ | --------------------------- | --------------------------------- |
| POST   | `/auth/telegram`            | Вход по initData                  |
| POST   | `/auth/dev`                 | Dev-вход (нет в production)       |
| GET    | `/users/me`                 | Профиль                           |
| PATCH  | `/users/me`                 | Часовой пояс                      |
| GET    | `/day`                      | Экран сегодняшнего дня            |
| GET    | `/day/:date`                | День из истории                   |
| GET/POST/PATCH | `/intention`        | Намерение дня                     |
| GET/POST/PATCH/DELETE | `/diary`     | Дневник                           |
| GET/POST/PATCH/DELETE | `/habits`    | Привычки, `POST /:id/toggle`      |
| GET/POST/PATCH/DELETE | `/reminders` | Напоминания, снузы                |
| GET    | `/calendar?year&month`      | Календарь за месяц                |
| GET    | `/stats`                    | Статистика и серия дней           |
| GET    | `/health`                   | Проверка живости                  |

Все, кроме `/auth/*` и `/health`, требуют `Authorization: Bearer <token>`.

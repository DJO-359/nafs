function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalDateString(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function getLocalTimeString(now = new Date()) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function getMinimumReminderTime(reminderDate: string, now = new Date()) {
  if (reminderDate !== getLocalDateString(now)) return undefined;

  return getLocalTimeString(new Date(now.getTime() + 60_000));
}

function parseLocalDateTime(date: string, time: string) {
  const candidate = new Date(`${date}T${time}:00`);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

export function validateReminderDateTime(
  date: string,
  time: string,
  now = new Date(),
) {
  if (!date || !time) return "Выберите дату и время";

  const today = getLocalDateString(now);
  if (date < today) return "Нельзя установить напоминание на прошедшую дату.";

  const candidate = parseLocalDateTime(date, time);
  if (!candidate) return "Выберите корректные дату и время.";

  if (date === today && candidate.getTime() < now.getTime() + 60_000) {
    return "Выберите время минимум через одну минуту.";
  }

  return null;
}

export function toReminderIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

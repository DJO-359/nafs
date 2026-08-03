/**
 * Работа с датами в часовом поясе пользователя.
 *
 * Раньше «сегодня» считалось двумя несовместимыми способами: где-то через
 * `toISOString()` (UTC), где-то через `setHours(0,0,0,0)` (локаль сервера).
 * Из-за этого у пользователя в UTC+3 вечерняя запись попадала во «вчера».
 * Все вычисления дня должны идти только через эти функции.
 *
 * Реализовано на Intl, без внешних зависимостей.
 */

export const DEFAULT_TIMEZONE = 'UTC';

/** Проверяет, что строка — валидная IANA-зона (например, 'Europe/Moscow'). */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Возвращает зону, если она валидна, иначе — UTC. */
export function safeTimeZone(timeZone: string | null | undefined): string {
  return timeZone && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
}

/**
 * Смещение зоны относительно UTC в конкретный момент времени, в миллисекундах.
 * Учитывает переход на летнее время, потому что считается на дату.
 */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = Number(part.value);
    }
  }

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    // Intl может отдать час 24 вместо 0 на границе суток
    values.hour === 24 ? 0 : values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
}

/**
 * Собирает момент времени (UTC) из локальных компонентов в заданной зоне.
 * Двойной проход нужен, чтобы корректно попасть в дату около перехода на DST.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second, 0);

  const firstOffset = timeZoneOffsetMs(new Date(naiveUtc), timeZone);
  let result = naiveUtc - firstOffset;

  const secondOffset = timeZoneOffsetMs(new Date(result), timeZone);
  if (secondOffset !== firstOffset) {
    result = naiveUtc - secondOffset;
  }

  return new Date(result);
}

/** Локальные компоненты даты и времени в заданной зоне. */
export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = Number(part.value);
    }
  }

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour === 24 ? 0 : values.hour,
    minute: values.minute,
    second: values.second,
  };
}

/** Дата в формате YYYY-MM-DD в зоне пользователя. */
export function formatDayInZone(date: Date, timeZone: string): string {
  // en-CA форматирует как YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Сегодняшняя дата (YYYY-MM-DD) в зоне пользователя. */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  return formatDayInZone(now, timeZone);
}

/** Строгая проверка формата YYYY-MM-DD с проверкой существования даты. */
export function isValidDayString(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;

  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, dayOfMonth));

  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === dayOfMonth
  );
}

/**
 * Границы суток пользователя в UTC — полуинтервал [start, end).
 * Использовать в запросах как `{ [Op.gte]: start, [Op.lt]: end }`,
 * а не `<= 23:59:59.999`, чтобы не терять последнюю миллисекунду.
 */
export function dayRangeInZone(
  day: string,
  timeZone: string,
): { start: Date; end: Date } {
  const [year, month, dayOfMonth] = day.split('-').map(Number);

  const start = zonedTimeToUtc(year, month, dayOfMonth, 0, 0, 0, timeZone);
  const end = zonedTimeToUtc(year, month, dayOfMonth + 1, 0, 0, 0, timeZone);

  return { start, end };
}

/** Границы сегодняшних суток пользователя в UTC. */
export function todayRangeInZone(
  timeZone: string,
  now: Date = new Date(),
): { start: Date; end: Date } {
  return dayRangeInZone(todayInZone(timeZone, now), timeZone);
}

/** Границы месяца в зоне пользователя — полуинтервал [start, end). */
export function monthRangeInZone(
  year: number,
  month: number,
  timeZone: string,
): { start: Date; end: Date } {
  const start = zonedTimeToUtc(year, month, 1, 0, 0, 0, timeZone);
  const end = zonedTimeToUtc(year, month + 1, 1, 0, 0, 0, timeZone);

  return { start, end };
}

/** Количество дней в месяце. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Прибавляет календарные дни, сохраняя локальное время в зоне пользователя.
 * Обычное `setDate(+1)` сдвинуло бы время на час при переходе на летнее время.
 */
export function addDaysInZone(
  date: Date,
  days: number,
  timeZone: string,
): Date {
  const parts = getZonedParts(date, timeZone);

  return zonedTimeToUtc(
    parts.year,
    parts.month,
    parts.day + days,
    parts.hour,
    parts.minute,
    parts.second,
    timeZone,
  );
}

/**
 * Прибавляет месяцы, сохраняя локальное время и зажимая день по длине месяца.
 * Без клампа `setMonth` превращает 31 января в 3 марта.
 */
export function addMonthsInZone(
  date: Date,
  months: number,
  timeZone: string,
): Date {
  const parts = getZonedParts(date, timeZone);

  const totalMonths = parts.month - 1 + months;
  const targetYear = parts.year + Math.floor(totalMonths / 12);
  const targetMonth = (((totalMonths % 12) + 12) % 12) + 1;

  const clampedDay = Math.min(parts.day, daysInMonth(targetYear, targetMonth));

  return zonedTimeToUtc(
    targetYear,
    targetMonth,
    clampedDay,
    parts.hour,
    parts.minute,
    parts.second,
    timeZone,
  );
}

/** День недели (0 — воскресенье) в зоне пользователя. */
export function weekdayInZone(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

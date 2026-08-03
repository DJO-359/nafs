import { ReminderRepeatType } from './enums/reminder-repeat-type.enum';
import {
  addDaysInZone,
  addMonthsInZone,
  weekdayInZone,
} from '../common/utils/timezone.util';

export interface RepeatRule {
  repeatType: ReminderRepeatType;
  repeatInterval: number;
  repeatDays: number[] | null;
}

/** Защита от бесконечного цикла, если правило повтора не двигает время вперёд. */
const MAX_ADVANCE_STEPS = 1000;

/** Один шаг расписания вперёд от переданного момента. */
export function advanceOnce(
  from: Date,
  rule: RepeatRule,
  timezone: string,
): Date | null {
  const interval =
    Number.isInteger(rule.repeatInterval) && rule.repeatInterval > 0
      ? rule.repeatInterval
      : 1;

  switch (rule.repeatType) {
    case ReminderRepeatType.DAILY:
      return addDaysInZone(from, 1, timezone);

    case ReminderRepeatType.INTERVAL:
    case ReminderRepeatType.CUSTOM:
      return addDaysInZone(from, interval, timezone);

    case ReminderRepeatType.MONTHLY:
      // addMonthsInZone зажимает день по длине месяца: 31 января -> 28/29 февраля,
      // а не 3 марта, как делал setMonth
      return addMonthsInZone(from, 1, timezone);

    case ReminderRepeatType.WEEKLY:
      return nextWeekly(from, rule.repeatDays, timezone);

    case ReminderRepeatType.NONE:
    default:
      return null;
  }
}

function nextWeekly(
  from: Date,
  repeatDays: number[] | null,
  timezone: string,
): Date {
  const days = (repeatDays ?? [])
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((left, right) => left - right);

  if (!days.length) {
    return addDaysInZone(from, 7, timezone);
  }

  const currentWeekday = weekdayInZone(from, timezone);

  for (let offset = 1; offset <= 7; offset++) {
    if (days.includes((currentWeekday + offset) % 7)) {
      return addDaysInZone(from, offset, timezone);
    }
  }

  return addDaysInZone(from, 7, timezone);
}

/**
 * Следующее срабатывание строго позже `now`.
 *
 * Раньше расписание сдвигалось ровно на один шаг от старого remindAt. После
 * простоя сервиса напоминание отправлялось, сдвигалось на день — всё ещё в
 * прошлом — и отправлялось снова на следующем тике: пользователь получал
 * пачку сообщений по одному в минуту. Здесь расписание догоняется до
 * актуального момента за один проход, а сообщение уходит одно.
 *
 * Возвращает null для разовых напоминаний — их следует помечать выполненными.
 */
export function nextOccurrenceAfter(
  from: Date,
  now: Date,
  rule: RepeatRule,
  timezone: string,
): Date | null {
  if (rule.repeatType === ReminderRepeatType.NONE) {
    return null;
  }

  let candidate = from;

  for (let step = 0; step < MAX_ADVANCE_STEPS; step++) {
    const next = advanceOnce(candidate, rule, timezone);

    if (!next || next.getTime() <= candidate.getTime()) {
      // Правило не двигает время вперёд — прекращаем, чтобы не зациклиться
      return null;
    }

    candidate = next;

    if (candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }

  return null;
}

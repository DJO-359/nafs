/** Предыдущий день для строки YYYY-MM-DD. */
export function previousDay(day: string): string {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, dayOfMonth - 1));

  return date.toISOString().slice(0, 10);
}

/**
 * Длина текущей серии активных дней.
 *
 * Раньше серия считалась перебором отсортированного списка дат, в который
 * попадали и будущие даты напоминаний. Первая же будущая дата давала
 * отрицательную разницу, цикл обрывался, и streak всегда равнялся нулю —
 * а у любого повторяющегося напоминания remindAt всегда в будущем.
 *
 * Здесь учитываются только дни не позже сегодняшнего. Если сегодня активности
 * ещё не было, серия считается от вчера — иначе она обнулялась бы каждое утро.
 */
export function calculateStreak(
  activeDates: Iterable<string>,
  today: string,
): number {
  const days = new Set<string>();

  for (const date of activeDates) {
    if (date && date <= today) {
      days.add(date);
    }
  }

  if (!days.size) {
    return 0;
  }

  let cursor = days.has(today) ? today : previousDay(today);
  let streak = 0;

  while (days.has(cursor)) {
    streak += 1;
    cursor = previousDay(cursor);
  }

  return streak;
}

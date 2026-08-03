import {
  addDaysInZone,
  addMonthsInZone,
  dayRangeInZone,
  formatDayInZone,
  isValidDayString,
  isValidTimeZone,
  safeTimeZone,
  todayInZone,
  weekdayInZone,
} from './timezone.util';

const MOSCOW = 'Europe/Moscow';
const NEW_YORK = 'America/New_York';

describe('timezone.util', () => {
  it('распознаёт валидные и невалидные зоны', () => {
    expect(isValidTimeZone(MOSCOW)).toBe(true);
    expect(isValidTimeZone('Nowhere/Nothing')).toBe(false);
    expect(safeTimeZone('Nowhere/Nothing')).toBe('UTC');
    expect(safeTimeZone(null)).toBe('UTC');
    expect(safeTimeZone(MOSCOW)).toBe(MOSCOW);
  });

  it('вечерняя запись в UTC+3 остаётся сегодняшней', () => {
    // Именно этот случай ломал серию дней: 23:30 по Москве — это уже
    // следующие сутки по UTC, и запись уезжала во «вчера»
    const evening = new Date('2026-07-28T20:30:00Z'); // 23:30 в Москве

    expect(formatDayInZone(evening, MOSCOW)).toBe('2026-07-28');
    expect(formatDayInZone(evening, 'UTC')).toBe('2026-07-28');

    const lateEvening = new Date('2026-07-28T21:30:00Z'); // 00:30 29-го в Москве
    expect(formatDayInZone(lateEvening, MOSCOW)).toBe('2026-07-29');
  });

  it('границы суток считаются в зоне пользователя', () => {
    const { start, end } = dayRangeInZone('2026-07-28', MOSCOW);

    // Полночь в Москве — это 21:00 предыдущего дня по UTC
    expect(start.toISOString()).toBe('2026-07-27T21:00:00.000Z');
    expect(end.toISOString()).toBe('2026-07-28T21:00:00.000Z');
    expect(end.getTime() - start.getTime()).toBe(24 * 3_600_000);
  });

  it('todayInZone отдаёт разные дни для разных зон', () => {
    const moment = new Date('2026-07-28T02:00:00Z');

    expect(todayInZone(MOSCOW, moment)).toBe('2026-07-28');
    // В Нью-Йорке это ещё 27 июля
    expect(todayInZone(NEW_YORK, moment)).toBe('2026-07-27');
  });

  it('addDaysInZone сохраняет локальное время', () => {
    const start = new Date('2026-07-28T06:00:00Z'); // 09:00 в Москве
    const next = addDaysInZone(start, 1, MOSCOW);

    expect(formatDayInZone(next, MOSCOW)).toBe('2026-07-29');

    const hour = new Intl.DateTimeFormat('en-GB', {
      timeZone: MOSCOW,
      hour: '2-digit',
      hour12: false,
    }).format(next);

    expect(Number(hour)).toBe(9);
  });

  it('addMonthsInZone зажимает день по длине месяца', () => {
    const jan31 = new Date('2026-01-31T09:00:00Z');

    expect(formatDayInZone(addMonthsInZone(jan31, 1, 'UTC'), 'UTC')).toBe(
      '2026-02-28',
    );

    const may31 = new Date('2026-05-31T09:00:00Z');
    expect(formatDayInZone(addMonthsInZone(may31, 1, 'UTC'), 'UTC')).toBe(
      '2026-06-30',
    );
  });

  it('weekdayInZone возвращает день недели по зоне', () => {
    // 2026-07-28 — вторник
    expect(weekdayInZone(new Date('2026-07-28T12:00:00Z'), MOSCOW)).toBe(2);
  });

  it('isValidDayString отсекает несуществующие даты', () => {
    expect(isValidDayString('2026-07-28')).toBe(true);
    expect(isValidDayString('2026-02-30')).toBe(false);
    expect(isValidDayString('abc')).toBe(false);
    expect(isValidDayString('2026-7-8')).toBe(false);
  });
});

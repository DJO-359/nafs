import { calculateStreak, previousDay } from './streak.util';

describe('streak.util', () => {
  it('previousDay корректно переходит через границу месяца', () => {
    expect(previousDay('2026-03-01')).toBe('2026-02-28');
    expect(previousDay('2026-01-01')).toBe('2025-12-31');
  });

  it('считает непрерывную серию до сегодня', () => {
    const streak = calculateStreak(
      ['2026-07-26', '2026-07-27', '2026-07-28'],
      '2026-07-28',
    );

    expect(streak).toBe(3);
  });

  it('не обнуляет серию, если сегодня активности ещё не было', () => {
    const streak = calculateStreak(['2026-07-26', '2026-07-27'], '2026-07-28');

    expect(streak).toBe(2);
  });

  it('обрывается на пропущенном дне', () => {
    const streak = calculateStreak(
      ['2026-07-20', '2026-07-27', '2026-07-28'],
      '2026-07-28',
    );

    expect(streak).toBe(2);
  });

  it('игнорирует будущие даты', () => {
    // Ключевой регресс: в список активных дней попадали даты будущих
    // напоминаний, из-за чего серия всегда получалась нулевой
    const streak = calculateStreak(
      ['2026-08-15', '2026-07-27', '2026-07-28'],
      '2026-07-28',
    );

    expect(streak).toBe(2);
  });

  it('пустой список даёт ноль', () => {
    expect(calculateStreak([], '2026-07-28')).toBe(0);
  });
});

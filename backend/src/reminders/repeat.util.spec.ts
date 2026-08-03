import { ReminderRepeatType } from './enums/reminder-repeat-type.enum';
import { nextOccurrenceAfter, advanceOnce } from './repeat.util';

const MOSCOW = 'Europe/Moscow';

function rule(
  repeatType: ReminderRepeatType,
  repeatInterval = 1,
  repeatDays: number[] | null = null,
) {
  return { repeatType, repeatInterval, repeatDays };
}

describe('repeat.util', () => {
  describe('nextOccurrenceAfter', () => {
    it('разовое напоминание не повторяется', () => {
      const from = new Date('2026-07-01T09:00:00Z');
      const now = new Date('2026-07-05T09:00:00Z');

      expect(
        nextOccurrenceAfter(from, now, rule(ReminderRepeatType.NONE), MOSCOW),
      ).toBeNull();
    });

    it('после долгого простоя догоняет расписание за один шаг', () => {
      // Ключевой регресс: раньше расписание сдвигалось ровно на один день от
      // старого remindAt, поэтому за 5 дней простоя пользователь получал
      // 5 сообщений подряд — по одному в минуту
      const from = new Date('2026-07-01T09:00:00Z');
      const now = new Date('2026-07-06T10:00:00Z');

      const next = nextOccurrenceAfter(
        from,
        now,
        rule(ReminderRepeatType.DAILY),
        MOSCOW,
      );

      expect(next).not.toBeNull();
      expect(next!.getTime()).toBeGreaterThan(now.getTime());

      // Ровно следующее срабатывание, а не через неделю
      const hoursAhead = (next!.getTime() - now.getTime()) / 3_600_000;
      expect(hoursAhead).toBeLessThanOrEqual(24);
    });

    it('ежедневное сохраняет локальное время', () => {
      const from = new Date('2026-07-01T06:00:00Z'); // 09:00 в Москве
      const now = new Date('2026-07-01T06:00:01Z');

      const next = nextOccurrenceAfter(
        from,
        now,
        rule(ReminderRepeatType.DAILY),
        MOSCOW,
      );

      const localHour = Number(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: MOSCOW,
          hour: '2-digit',
          hour12: false,
        }).format(next!),
      );

      expect(localHour).toBe(9);
    });

    it('интервал в 0 дней не зацикливает планировщик', () => {
      // repeatInterval без @Min(1) пропускал ноль, и сдвиг на 0 дней
      // заставлял слать одно и то же сообщение каждую минуту
      const from = new Date('2026-07-01T09:00:00Z');
      const now = new Date('2026-07-10T09:00:00Z');

      const next = nextOccurrenceAfter(
        from,
        now,
        rule(ReminderRepeatType.INTERVAL, 0),
        MOSCOW,
      );

      expect(next).not.toBeNull();
      expect(next!.getTime()).toBeGreaterThan(now.getTime());
    });

    it('еженедельное выбирает ближайший разрешённый день недели', () => {
      // 2026-07-01 — среда (3). Разрешены понедельник и пятница
      const from = new Date('2026-07-01T09:00:00Z');
      const now = new Date('2026-07-01T09:00:01Z');

      const next = nextOccurrenceAfter(
        from,
        now,
        rule(ReminderRepeatType.WEEKLY, 1, [1, 5]),
        MOSCOW,
      );

      expect(next).not.toBeNull();
      expect(next!.getUTCDay()).toBe(5);
    });

    it('еженедельное без выбранных дней сдвигается на неделю', () => {
      const from = new Date('2026-07-01T09:00:00Z');
      const now = new Date('2026-07-01T09:00:01Z');

      const next = nextOccurrenceAfter(
        from,
        now,
        rule(ReminderRepeatType.WEEKLY, 1, []),
        MOSCOW,
      );

      const daysAhead = (next!.getTime() - from.getTime()) / (24 * 3_600_000);

      expect(Math.round(daysAhead)).toBe(7);
    });
  });

  describe('advanceOnce (месячный повтор)', () => {
    it('31 января превращается в 28 февраля, а не в 3 марта', () => {
      // setMonth без клампа перепрыгивал через февраль
      const from = new Date('2026-01-31T09:00:00Z');

      const next = advanceOnce(from, rule(ReminderRepeatType.MONTHLY), 'UTC');

      expect(next).not.toBeNull();
      expect(next!.getUTCMonth()).toBe(1); // февраль
      expect(next!.getUTCDate()).toBe(28);
    });
  });
});

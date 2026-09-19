import { BadRequestException } from '@nestjs/common';

import { assertReminderAtInFuture } from './reminder-date.util';

describe('assertReminderAtInFuture', () => {
  const now = new Date('2026-09-19T20:33:00Z');

  it.each([
    ['сегодня + время вчера', '2026-09-19T20:32:00Z', false],
    ['сегодня + текущее время', '2026-09-19T20:33:00Z', false],
    ['сегодня + 1 минута', '2026-09-19T20:34:00Z', true],
    ['сегодня + 2 минуты', '2026-09-19T20:35:00Z', true],
    ['завтра + любое время', '2026-09-20T00:00:00Z', true],
    ['вчера + любое время', '2026-09-18T23:59:00Z', false],
  ])('%s', (_label, value, accepted) => {
    if (accepted) {
      expect(() => assertReminderAtInFuture(value, now)).not.toThrow();
    } else {
      expect(() => assertReminderAtInFuture(value, now)).toThrow(
        BadRequestException,
      );
    }
  });
});

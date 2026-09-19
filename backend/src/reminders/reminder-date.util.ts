import { BadRequestException } from '@nestjs/common';

export function assertReminderAtInFuture(
  remindAt: string | Date,
  now = new Date(),
) {
  const date = remindAt instanceof Date ? remindAt : new Date(remindAt);

  if (Number.isNaN(date.getTime()) || date.getTime() <= now.getTime()) {
    throw new BadRequestException('Время напоминания должно быть в будущем');
  }

  return date;
}

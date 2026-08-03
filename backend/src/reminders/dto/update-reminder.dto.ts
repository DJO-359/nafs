import { PartialType } from '@nestjs/mapped-types';

import { CreateReminderDto } from './create-reminder.dto';

/**
 * Все поля необязательны, включая настройки повтора — раньше обновление
 * принимало только title и remindAt, поэтому изменить повтор было невозможно.
 */
export class UpdateReminderDto extends PartialType(CreateReminderDto) {}

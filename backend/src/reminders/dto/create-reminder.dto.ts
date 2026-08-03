import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

import { ReminderRepeatType } from '../enums/reminder-repeat-type.enum';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  remindAt!: string;

  @IsOptional()
  @IsEnum(ReminderRepeatType)
  repeatType?: ReminderRepeatType;

  /**
   * Без Min(1) ноль проходил валидацию, а сдвиг на 0 дней заставлял
   * планировщик слать одно и то же напоминание каждую минуту навсегда.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  repeatInterval?: number;

  /**
   * Дни недели, 0 — воскресенье. Раньше @IsArray() пропускал массив строк,
   * и проверка includes() в планировщике молча не срабатывала.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  repeatDays?: number[];
}

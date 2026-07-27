import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsInt,
} from 'class-validator';

import { ReminderRepeatType } from '../enums/reminder-repeat-type.enum';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt: string;

  @IsOptional()
  @IsEnum(ReminderRepeatType)
  repeatType?: ReminderRepeatType;

  @IsOptional()
  @IsInt()
  repeatInterval?: number;

  @IsOptional()
  @IsArray()
  repeatDays?: number[];
}

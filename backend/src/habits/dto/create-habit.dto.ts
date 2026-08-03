import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

import { PeriodType } from '../models/habit.model';

/** Даты привычки — календарные (YYYY-MM-DD), без времени и часового пояса. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  icon!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  color!: string;

  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  customPeriodDays?: number;

  // IsDateString пропускал полные ISO-строки со временем, а колонка — DATEONLY
  @Matches(DAY_PATTERN, {
    message: 'startDate должен быть в формате YYYY-MM-DD',
  })
  startDate!: string;

  @Matches(DAY_PATTERN, { message: 'endDate должен быть в формате YYYY-MM-DD' })
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PeriodType } from '../models/habit.model';

export class CreateHabitDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  icon: string;

  @IsString()
  color: string;

  @IsEnum(PeriodType)
  periodType: PeriodType;

  @IsOptional()
  @IsInt()
  @Min(1)
  customPeriodDays?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

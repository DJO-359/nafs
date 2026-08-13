import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * DTO для обновления счётчика Тасбих.
 *
 * Все поля опциональны.
 */
export class UpdateTasbihCounterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  /**
   * Для обычного счётчика: целое число >= 1.
   * Для бесконечного счётчика: не должно быть.
   */
  @IsOptional()
  @ValidateIf((obj) => obj.isInfinite === false || obj.isInfinite === undefined)
  @IsInt()
  @Min(1)
  target?: number | null;

  @IsOptional()
  @IsBoolean()
  isInfinite?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  count?: number;
}

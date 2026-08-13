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
 * DTO для создания нового счётчика Тасбих.
 *
 * Валидация:
 * - name: обязательная строка, не пустая
 * - target: для обычного счётчика — положительное целое число
 *           для бесконечного счётчика — NULL (опускается)
 * - isInfinite: флаг бесконечного счётчика (по умолчанию false)
 * - count: опционально, начальное значение (по умолчанию 0)
 */
export class CreateTasbihCounterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  /**
   * Для обычного счётчика: целое число >= 1.
   * Для бесконечного счётчика: не должно быть.
   */
  @ValidateIf((obj) => !obj.isInfinite)
  @IsInt()
  @Min(1)
  target?: number;

  @IsOptional()
  @IsBoolean()
  isInfinite?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  count?: number;
}

import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/**
 * Раньше year и month приходили как сырые строки и превращались в Number()
 * без проверки: ?year=abc давало NaN и пустой календарь без объяснения.
 */
export class CalendarQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(2200)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}

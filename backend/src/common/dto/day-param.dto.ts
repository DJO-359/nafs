import { Matches } from 'class-validator';

/**
 * Параметр даты в URL.
 * Раньше строка из @Param уходила прямо в new Date(): GET /day/abc давало
 * Invalid Date в запросе и необработанный 500 вместо 400.
 */
export class DayParamDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата должна быть в формате YYYY-MM-DD',
  })
  date!: string;
}

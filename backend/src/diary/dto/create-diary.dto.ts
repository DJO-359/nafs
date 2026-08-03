import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Раньше контроллер принимал инлайн-тип { content: string }, который
 * глобальный ValidationPipe пропускает без проверок: content=null давал 500
 * по NOT NULL, а текст любой длины уходил в базу как есть.
 */
export class CreateDiaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}

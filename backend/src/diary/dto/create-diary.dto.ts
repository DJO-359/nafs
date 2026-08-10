import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * Раньше контроллер принимал инлайн-тип { content: string }, который
 * глобальный ValidationPipe пропускал без проверок: content=null давал 500
 * по NOT NULL, а текст любой длины уходил в базу как есть.
 */
export class CreateDiaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'Цвет должен быть в формате #RRGGBB',
  })
  color?: string;

  @IsOptional()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^.$|^.{0}$/u, {
    message: 'Emoji должен быть одним символом',
  })
  pinEmoji?: string;
}

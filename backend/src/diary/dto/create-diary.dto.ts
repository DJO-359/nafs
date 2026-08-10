import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { IsPinEmoji } from '../validators/is-pin-emoji';

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
  @IsPinEmoji({ message: 'Emoji должен быть одним из допустимых значков' })
  pinEmoji?: string | null;
}

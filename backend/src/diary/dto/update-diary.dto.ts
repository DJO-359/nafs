import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { IsPinEmoji } from '../validators/is-pin-emoji';

/**
 * Не PartialType: у записи дневника единственное содержательное поле,
 * и обновление без него не имеет смысла — пусть валидация ловит это сразу.
 */
export class UpdateDiaryDto {
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
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString({ each: false })
  @IsPinEmoji({ message: 'Emoji должен быть одним из допустимых значков' })
  pinEmoji?: string | null;
}

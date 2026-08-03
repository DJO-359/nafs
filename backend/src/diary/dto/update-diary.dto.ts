import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Не PartialType: у записи дневника единственное содержательное поле,
 * и обновление без него не имеет смысла — пусть валидация ловит это сразу.
 */
export class UpdateDiaryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}

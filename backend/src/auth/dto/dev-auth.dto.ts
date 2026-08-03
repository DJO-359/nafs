import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Вход в обход Telegram для локальной разработки.
 * Эндпоинт физически отсутствует при NODE_ENV=production.
 */
export class DevAuthDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

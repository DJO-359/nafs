import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  /** Часовой пояс IANA, например Europe/Moscow. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class TelegramAuthDto {
  /**
   * Сырая строка window.Telegram.WebApp.initData.
   * Подпись проверяется на сервере — клиенту здесь не доверяем ничему.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  initData!: string;

  /**
   * Часовой пояс клиента (IANA, из Intl.DateTimeFormat().resolvedOptions()).
   * Нужен, чтобы «сегодня» на сервере совпадало с «сегодня» у пользователя.
   */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateWinDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

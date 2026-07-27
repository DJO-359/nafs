import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIntentionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  text: string;
}

import { IsBoolean, IsString, Matches, MaxLength } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @Matches(/^[0-2][0-9]:[0-5][0-9]$/)
  wakeTime: string;

  @IsString()
  @Matches(/^[0-2][0-9]:[0-5][0-9]$/)
  sleepTime: string;

  @IsBoolean()
  eveningReminderEnabled: boolean;
}

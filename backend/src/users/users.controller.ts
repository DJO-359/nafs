import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';

/**
 * Раньше здесь был GET /users, отдававший всю базу пользователей любому
 * авторизованному, и POST /users без валидации. Оба удалены:
 * пользователь может работать только со своим профилем.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: AuthRequest) {
    const user = await this.usersService.findById(req.user.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      wakeTime: user.wakeTime,
      sleepTime: user.sleepTime,
      eveningReminderEnabled: user.eveningReminderEnabled,
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  @Patch('me')
  async updateSettings(
    @Req() req: AuthRequest,
    @Body() dto: UpdateSettingsDto,
  ) {
    if (dto.timezone) {
      await this.usersService.updateTimezone(req.user.id, dto.timezone);
    }

    return this.me(req);
  }

  @Post('onboarding')
  async completeOnboarding(
    @Req() req: AuthRequest,
    @Body() dto: CompleteOnboardingDto,
  ) {
    await this.usersService.completeOnboarding(req.user.id, dto);

    return this.me(req);
  }
}

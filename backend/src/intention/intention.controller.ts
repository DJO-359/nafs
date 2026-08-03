import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';
import { IntentionService } from './intention.service';
import { CreateIntentionDto } from './dto/create-intention.dto';

@Controller('intention')
@UseGuards(JwtAuthGuard)
export class IntentionController {
  constructor(private readonly intentionService: IntentionService) {}

  @Post()
  setTodayIntention(@Req() req: AuthRequest, @Body() dto: CreateIntentionDto) {
    return this.intentionService.setTodayIntention(
      req.user.id,
      req.user.timezone,
      dto.text,
    );
  }

  @Get()
  getTodayIntention(@Req() req: AuthRequest) {
    return this.intentionService.getTodayIntention(
      req.user.id,
      req.user.timezone,
    );
  }

  @Patch('complete')
  completeTodayIntention(@Req() req: AuthRequest) {
    return this.intentionService.completeTodayIntention(
      req.user.id,
      req.user.timezone,
    );
  }
}

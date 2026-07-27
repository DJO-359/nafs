import {
  Controller,
  Get,
  Param, // ← добавлен Param
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DayService } from './day.service';

interface AuthRequest extends Request {
  user: {
    id: string;
    telegramId: string;
  };
}

@Controller('day')
@UseGuards(JwtAuthGuard)
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Get()
  async getToday(@Req() req: AuthRequest) {
    return this.dayService.getToday(req.user.id);
  }

  // ----- добавленный метод для получения дня по дате -----
  @Get(':date')
  async getByDate(@Req() req: AuthRequest, @Param('date') date: string) {
    return this.dayService.getByDate(req.user.id, date);
  }
}

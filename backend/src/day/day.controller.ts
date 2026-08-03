import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';
import { DayParamDto } from '../common/dto/day-param.dto';
import { DayService } from './day.service';

@Controller('day')
@UseGuards(JwtAuthGuard)
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Get()
  getToday(@Req() req: AuthRequest) {
    return this.dayService.getToday(req.user.id, req.user.timezone);
  }

  @Get(':date')
  getByDate(@Req() req: AuthRequest, @Param() params: DayParamDto) {
    return this.dayService.getByDate(
      req.user.id,
      req.user.timezone,
      params.date,
    );
  }
}

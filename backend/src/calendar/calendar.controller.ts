import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';
import { CalendarService } from './calendar.service';
import { CalendarQueryDto } from './dto/calendar-query.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getMonth(@Req() req: AuthRequest, @Query() query: CalendarQueryDto) {
    return this.calendarService.getMonth(
      req.user.id,
      req.user.timezone,
      query.year,
      query.month,
    );
  }
}

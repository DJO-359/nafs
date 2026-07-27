import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CalendarService } from "./calendar.service";

@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getMonth(
    @Req() req,
    @Query("year") year: string,
    @Query("month") month: string,
  ) {
    return this.calendarService.getMonth(
      req.user.id,
      Number(year),
      Number(month),
    );
  }
}

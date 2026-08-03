import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';
import { DayParamDto } from '../common/dto/day-param.dto';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.remindersService.findAll(req.user.id);
  }

  @Get('day/:date')
  getByDate(@Req() req: AuthRequest, @Param() params: DayParamDto) {
    return this.remindersService.getByDate(
      req.user.id,
      req.user.timezone,
      params.date,
    );
  }

  @Patch(':id/complete')
  complete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.remindersService.complete(req.user.id, id);
  }

  @Patch(':id/snooze/hour')
  snoozeHour(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.remindersService.snoozeByHours(req.user.id, id, 1);
  }

  @Patch(':id/snooze/tomorrow')
  snoozeTomorrow(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.remindersService.snoozeToTomorrow(
      req.user.id,
      id,
      req.user.timezone,
    );
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.remindersService.remove(req.user.id, id);
  }
}

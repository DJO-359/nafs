import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.habitsService.findAll(req.user.id, req.user.timezone);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateHabitDto) {
    return this.habitsService.create(req.user.id, req.user.timezone, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(req.user.id, req.user.timezone, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.habitsService.remove(req.user.id, id);
  }

  @Post(':id/toggle')
  toggle(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.habitsService.toggle(req.user.id, req.user.timezone, id);
  }
}

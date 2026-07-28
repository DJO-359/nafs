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
import { Request } from 'express';

import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.habitsService.findAll(req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateHabitDto,
  ) {
    return this.habitsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.habitsService.remove(req.user.id, id);
  }

  @Post(':id/toggle')
  toggle(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.habitsService.toggle(req.user.id, id);
  }
}

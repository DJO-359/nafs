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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.remindersService.findAll(req.user.id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  complete(@Param('id') id: string, @Req() req) {
    return this.remindersService.complete(id, req.user.id);
  }

  // ----- добавленный метод удаления -----
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req, @Param('id') id: string) {
    return this.remindersService.remove(req.user.id, id);
  }

  // ----- добавленный метод обновления -----
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req, @Param('id') id: string, @Body() dto: CreateReminderDto) {
    return this.remindersService.update(req.user.id, id, dto);
  }
}

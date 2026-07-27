import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { DiaryService } from './diary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('diary')
@UseGuards(JwtAuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() body: { content: string },
  ) {
    return this.diaryService.create(req.user.id, body.content);
  }

  @Get()
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.diaryService.findAll(req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(@Req() req: Request & { user: { id: string } }) {
    return this.diaryService.getHistory(req.user.id);
  }
}

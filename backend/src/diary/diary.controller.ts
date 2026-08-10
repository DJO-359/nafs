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

import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';

@Controller('diary')
@UseGuards(JwtAuthGuard)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateDiaryDto) {
    return this.diaryService.create(
      req.user.id,
      req.user.timezone,
      dto.content,
      dto.color,
    );
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.diaryService.findAll(req.user.id);
  }

  @Get('history')
  getHistory(@Req() req: AuthRequest) {
    return this.diaryService.getHistory(req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDiaryDto,
  ) {
    return this.diaryService.update(req.user.id, id, {
      content: dto.content,
      color: dto.color,
      isPinned: dto.isPinned,
      pinEmoji: dto.pinEmoji,
    });
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.diaryService.remove(req.user.id, id);
  }
}

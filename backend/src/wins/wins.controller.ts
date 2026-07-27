import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';

import { WinsService } from './wins.service';
import { CreateWinDto } from './dto/create-win.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';

@Controller('wins')
export class WinsController {
  constructor(private readonly winsService: WinsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthRequest, @Body() dto: CreateWinDto) {
    return this.winsService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: AuthRequest) {
    return this.winsService.findAll(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: CreateWinDto,
  ) {
    return this.winsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.winsService.remove(req.user.id, id);
  }
}

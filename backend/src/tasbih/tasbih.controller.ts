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

import { TasbihService } from './tasbih.service';
import { CreateTasbihCounterDto } from './dto/create-tasbih-counter.dto';
import { UpdateTasbihCounterDto } from './dto/update-tasbih-counter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';

@Controller('tasbih')
@UseGuards(JwtAuthGuard)
export class TasbihController {
  constructor(private readonly tasbihService: TasbihService) {}

  /**
   * GET /tasbih
   * Получить все счётчики текущего пользователя.
   */
  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.tasbihService.findAll(req.user.id);
  }

  /**
   * POST /tasbih
   * Создать новый счётчик.
   */
  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateTasbihCounterDto) {
    return this.tasbihService.create(req.user.id, dto);
  }

  /**
   * PATCH /tasbih/:id
   * Обновить счётчик.
   */
  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTasbihCounterDto,
  ) {
    return this.tasbihService.update(req.user.id, id, dto);
  }

  /**
   * DELETE /tasbih/:id
   * Удалить счётчик.
   */
  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.tasbihService.remove(req.user.id, id);
  }

  /**
   * POST /tasbih/:id/increment
   * Увеличить count на 1.
   */
  @Post(':id/increment')
  increment(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.tasbihService.increment(req.user.id, id);
  }

  /**
   * POST /tasbih/:id/reset
   * Сбросить count в 0.
   */
  @Post(':id/reset')
  reset(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.tasbihService.reset(req.user.id, id);
  }
}

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntentionService } from './intention.service';
import { CreateIntentionDto } from './dto/create-intention.dto'; // <-- добавлен импорт

interface AuthRequest extends Request {
  user: {
    id: string;
    telegramId: string;
  };
}

@Controller('intention')
@UseGuards(JwtAuthGuard)
export class IntentionController {
  constructor(private readonly intentionService: IntentionService) {}

  /**
   * Создать или обновить намерение на сегодня.
   */
  @Post()
  async setTodayIntention(
    @Req() req: AuthRequest,
    @Body() dto: CreateIntentionDto, // <-- вместо body: { text: string }
  ) {
    return this.intentionService.setTodayIntention(req.user.id, dto.text);
  }

  /**
   * Получить сегодняшнее намерение.
   */
  @Get()
  async getTodayIntention(@Req() req: AuthRequest) {
    return this.intentionService.getTodayIntention(req.user.id);
  }

  /**
   * Отметить сегодняшнее намерение выполненным.
   */
  @Patch('complete')
  async completeTodayIntention(@Req() req: AuthRequest) {
    return this.intentionService.completeTodayIntention(req.user.id);
  }
}

import { Controller, Get, Logger, Param, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/types/auth-request';
import { DayParamDto } from '../common/dto/day-param.dto';
import { DayService } from './day.service';

@Controller('day')
@UseGuards(JwtAuthGuard)
export class DayController {
  private readonly logger = new Logger(DayController.name);

  constructor(private readonly dayService: DayService) {}

  @Get()
  getToday(@Req() req: AuthRequest) {
    this.logger.log('[GET /day] start');

    return this.dayService
      .getToday(req.user.id, req.user.timezone)
      .then((result) => {
        this.logger.log('[GET /day] success');
        return result;
      })
      .catch((error) => {
        this.logger.error('[GET /day] failure', this.formatError(error));
        throw error;
      });
  }

  @Get(':date')
  getByDate(@Req() req: AuthRequest, @Param() params: DayParamDto) {
    this.logger.log(`[GET /day/:date] start date=${params.date}`);

    return this.dayService
      .getByDate(req.user.id, req.user.timezone, params.date)
      .then((result) => {
        this.logger.log('[GET /day/:date] success');
        return result;
      })
      .catch((error) => {
        this.logger.error(
          `[GET /day/:date] failure date=${params.date}`,
          this.formatError(error),
        );
        throw error;
      });
  }

  private formatError(error: unknown): string {
    const candidate = error as {
      message?: string;
      name?: string;
      original?: { message?: string; code?: string };
      parent?: { message?: string; code?: string };
    };

    return JSON.stringify({
      message: candidate?.message,
      name: candidate?.name,
      originalMessage: candidate?.original?.message,
      parentMessage: candidate?.parent?.message,
      originalCode: candidate?.original?.code,
      parentCode: candidate?.parent?.code,
    });
  }
}

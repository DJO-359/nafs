import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

/**
 * Health probe для платформы деплоя.
 * Раньше AppController не был зарегистрирован в AppModule, поэтому
 * GET / отдавал 404 и проверять живость приложения было нечем.
 */
@Controller()
export class HealthController {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  @Get()
  root() {
    return { name: 'nafs-api', status: 'ok' };
  }

  @Get('health')
  async health() {
    try {
      await this.sequelize.authenticate();
    } catch {
      throw new ServiceUnavailableException('База данных недоступна');
    }

    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}

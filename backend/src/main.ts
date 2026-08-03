import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

function parseCorsOrigins(raw: string, isProduction: boolean): string[] {
  const origins = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!isProduction) {
    origins.push('http://localhost:5173');
  }

  return origins;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  app.use(helmet());

  // Не раскрываем used-фреймворк заголовком X-Powered-By
  const expressApp = app.getHttpAdapter().getInstance() as {
    disable: (setting: string) => void;
  };
  expressApp.disable('x-powered-by');

  const allowedOrigins = parseCorsOrigins(
    config.get<string>('CORS_ORIGINS') ?? '',
    isProduction,
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Запросы без Origin (мобильные клиенты, curl, health-check) не блокируем
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowed =
        allowedOrigins.includes(origin) ||
        // Preview-домены Vercel вида https://nafs-<hash>.vercel.app
        /^https:\/\/nafs-[a-z0-9-]+\.vercel\.app$/.test(origin);

      callback(
        allowed ? null : new Error(`Origin ${origin} не разрешён`),
        allowed,
      );
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Авторизация идёт Bearer-заголовком, куки не используются
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Нужно, чтобы onModuleDestroy успел остановить polling Telegram при рестарте
  app.enableShutdownHooks();

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(
    `Nafs API запущен на порту ${port} (${isProduction ? 'production' : 'development'})`,
  );
  logger.log(
    `Разрешённые origin: ${allowedOrigins.join(', ') || '(только preview Vercel)'}`,
  );
}

void bootstrap();

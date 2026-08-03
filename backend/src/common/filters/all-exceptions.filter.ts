import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseError, UniqueConstraintError, ValidationError } from 'sequelize';
import { randomUUID } from 'node:crypto';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  requestId: string;
  timestamp: string;
  path: string;
}

/**
 * Единая точка обработки ошибок.
 * Раньше ошибка Sequelize уходила клиенту дефолтным 500 без опознавательных
 * знаков, а в логах не было ни пути, ни пользователя — отлаживать было нечем.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { user?: { id?: string } }>();

    const requestId = randomUUID();
    const { status, message, error } = this.describe(exception);

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      error,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    const context = [
      `${request.method} ${request.url}`,
      `requestId=${requestId}`,
      request.user?.id ? `userId=${request.user.id}` : null,
    ]
      .filter(Boolean)
      .join(' ');

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `${context} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${context} -> ${status}: ${JSON.stringify(message)}`);
    }

    response.status(status).json(body);
  }

  private describe(exception: unknown): {
    status: number;
    message: string | string[];
    error?: string;
  } {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status: exception.getStatus(), message: payload };
      }

      const record = payload as Record<string, unknown>;

      return {
        status: exception.getStatus(),
        message: (record.message as string | string[]) ?? exception.message,
        error: record.error as string | undefined,
      };
    }

    if (exception instanceof UniqueConstraintError) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'Такая запись уже существует',
        error: 'Conflict',
      };
    }

    if (exception instanceof ValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: exception.errors.map((item) => item.message),
        error: 'Bad Request',
      };
    }

    if (exception instanceof BaseError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'База данных временно недоступна',
        error: 'Service Unavailable',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
      error: 'Internal Server Error',
    };
  }
}

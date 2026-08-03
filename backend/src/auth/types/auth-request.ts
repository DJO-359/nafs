import { Request } from 'express';

import { AuthenticatedUser } from '../strategies/jwt.strategy';

/**
 * Запрос, прошедший JwtAuthGuard.
 * Единый тип вместо трёх инлайновых объявлений в контроллерах —
 * одно из них по ошибке наследовалось от DOM-типа Request.
 */
export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

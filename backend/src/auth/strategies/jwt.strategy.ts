import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  telegramId?: string | null;
}

export interface AuthenticatedUser {
  id: string;
  telegramId: string | null;
  timezone: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Проверяем существование пользователя в БД, а не только подпись токена:
   * иначе удалённый пользователь продолжал бы работать до конца срока JWT.
   * Заодно кладём timezone в request — от неё считается «сегодня».
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      timezone: user.timezone,
    };
  }
}

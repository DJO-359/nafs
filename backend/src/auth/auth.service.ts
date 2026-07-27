import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { AuthProvider, User } from '../users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async authenticateTelegram(
    dto: TelegramAuthDto,
  ): Promise<{ user: User; accessToken: string }> {
    let user = await this.usersService.findByTelegramId(dto.telegramId);

    if (!user) {
      user = await this.usersService.create({
        telegramId: dto.telegramId,
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        authProvider: AuthProvider.TELEGRAM,
      });
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return {
      user,
      accessToken,
    };
  }
}

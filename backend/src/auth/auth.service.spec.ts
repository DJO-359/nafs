import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthProvider, User } from '../users/models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByTelegramId: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findByTelegramId: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return an existing user and token when telegram account is already registered', async () => {
    const existingUser = {
      id: 'user-1',
      telegramId: '123456',
      username: 'alice',
      authProvider: AuthProvider.TELEGRAM,
    } as User;

    usersService.findByTelegramId.mockResolvedValue(existingUser);

    const result = await service.authenticateTelegram({
      telegramId: '123456',
      username: 'alice',
    });

    expect(result).toEqual({
      user: existingUser,
      accessToken: 'jwt-token',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: existingUser.id,
      telegramId: existingUser.telegramId,
    });
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('should create a new user and token when telegram account is not registered', async () => {
    const createdUser = {
      id: 'user-2',
      telegramId: '654321',
      username: 'bob',
      authProvider: AuthProvider.TELEGRAM,
    } as User;

    usersService.findByTelegramId.mockResolvedValue(null);
    usersService.create.mockResolvedValue(createdUser);

    const result = await service.authenticateTelegram({
      telegramId: '654321',
      username: 'bob',
      firstName: 'Bob',
      lastName: 'Smith',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      telegramId: '654321',
      username: 'bob',
      firstName: 'Bob',
      lastName: 'Smith',
      authProvider: AuthProvider.TELEGRAM,
    });
    expect(result).toEqual({
      user: createdUser,
      accessToken: 'jwt-token',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: createdUser.id,
      telegramId: createdUser.telegramId,
    });
  });
});

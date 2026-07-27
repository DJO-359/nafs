import { AuthProvider } from '../models/user.model';

export class CreateUserDto {
  telegramId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  authProvider?: AuthProvider;
}

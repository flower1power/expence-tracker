import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginCommand } from './login.command';
import { GetUserByEmailQuery } from '../../user/queries';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { email, password } = command;

    // Получаем пользователя
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Генерируем JWT токен
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}

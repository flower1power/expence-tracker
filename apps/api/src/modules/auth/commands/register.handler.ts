import { CommandHandler, ICommandHandler, QueryBus, CommandBus } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from './register.command';
import { GetUserByEmailQuery } from '../../user/queries';
import { CreateUserCommand } from '../../user/commands';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Обработчик команды регистрации нового пользователя.
 * Проверяет уникальность email, хеширует пароль и выдаёт JWT-токен.
 */
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Выполняет регистрацию пользователя.
   *
   * @param command - Email, имя и пароль нового пользователя
   * @returns JWT access-токен и данные созданного пользователя
   * @throws ConflictException если пользователь с таким email уже существует
   */
  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const { email, name, password } = command;

    const existingUser = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.commandBus.execute(new CreateUserCommand(email, name, passwordHash));

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

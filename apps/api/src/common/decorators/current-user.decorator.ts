import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../modules/user/entities/user.entity';

/**
 * Декоратор для извлечения текущего аутентифицированного пользователя из request.
 * Заполняется JwtStrategy после успешной валидации токена.
 *
 * @returns Пользователь из request.user
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

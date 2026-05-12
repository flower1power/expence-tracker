import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { QueryBus } from '@nestjs/cqrs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { GetUserByIdQuery } from '../../user/queries';
import { User } from '../../user/entities/user.entity';

/**
 * Passport-стратегия для валидации JWT-токена из заголовка Authorization.
 * Результат помещается в request.user и доступен через @CurrentUser().
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly queryBus: QueryBus
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Валидирует payload JWT-токена и возвращает пользователя.
   *
   * @param payload - Декодированный payload с sub (userId) и email
   * @returns Пользователь, соответствующий payload.sub
   * @throws UnauthorizedException если пользователь не найден в БД
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(payload.sub));
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

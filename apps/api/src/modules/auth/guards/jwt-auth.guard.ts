import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard для защиты маршрутов по JWT-токену из заголовка Authorization. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

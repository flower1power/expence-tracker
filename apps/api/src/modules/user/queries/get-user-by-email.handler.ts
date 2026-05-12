import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { UserRepository } from '../user.repository';
import { User } from '../entities/user.entity';

/** Обработчик запроса на получение пользователя по email. */
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Возвращает пользователя по email.
   *
   * @param query - Запрос с email пользователя
   * @returns Пользователь или null, если не найден
   */
  async execute(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userRepository.findByEmail(query.email);
  }
}

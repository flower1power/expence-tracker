import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { UserRepository } from '../user.repository';
import { User } from '../entities/user.entity';

/** Обработчик запроса на получение пользователя по UUID. */
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Возвращает пользователя по UUID.
   *
   * @param query - Запрос с UUID пользователя
   * @returns Пользователь или null, если не найден
   */
  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.userRepository.findById(query.id);
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { UserRepository } from '../user.repository';
import { User } from '../entities/user.entity';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByEmailQuery): Promise<User | null> {
    return this.userRepository.findByEmail(query.email);
  }
}

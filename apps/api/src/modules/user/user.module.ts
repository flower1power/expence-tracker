import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserRepository } from './user.repository';
import { CreateUserHandler } from './commands';
import { GetUserByEmailHandler, GetUserByIdHandler } from './queries';

const CommandHandlers = [CreateUserHandler];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [UserRepository, ...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}

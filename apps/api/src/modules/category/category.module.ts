import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import {
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
} from './commands';
import {
  GetAllCategoriesHandler,
  GetCategoryByIdHandler,
} from './queries';

const CommandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  DeleteCategoryHandler,
];

const QueryHandlers = [GetAllCategoriesHandler, GetCategoryByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CategoryController],
  providers: [CategoryRepository, ...CommandHandlers, ...QueryHandlers],
})
export class CategoryModule {}

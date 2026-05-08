import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllCategoriesQuery } from './get-all-categories.query';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

@QueryHandler(GetAllCategoriesQuery)
export class GetAllCategoriesHandler
  implements IQueryHandler<GetAllCategoriesQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetAllCategoriesQuery): Promise<Category[]> {
    return this.categoryRepository.findAllByUserId(query.userId);
  }
}

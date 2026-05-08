import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from './get-category-by-id.query';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler
  implements IQueryHandler<GetCategoryByIdQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoryByIdQuery): Promise<Category | null> {
    return this.categoryRepository.findById(query.id);
  }
}

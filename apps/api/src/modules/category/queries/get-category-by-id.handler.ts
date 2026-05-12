import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from './get-category-by-id.query';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

/** Обработчик запроса на получение категории по UUID. */
@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler
  implements IQueryHandler<GetCategoryByIdQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Возвращает категорию по UUID.
   *
   * @param query - Запрос с UUID категории
   * @returns Категория или null, если не найдена
   */
  async execute(query: GetCategoryByIdQuery): Promise<Category | null> {
    return this.categoryRepository.findById(query.id);
  }
}

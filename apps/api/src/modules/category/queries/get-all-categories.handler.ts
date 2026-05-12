import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllCategoriesQuery } from './get-all-categories.query';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

/** Обработчик запроса на получение всех категорий пользователя. */
@QueryHandler(GetAllCategoriesQuery)
export class GetAllCategoriesHandler
  implements IQueryHandler<GetAllCategoriesQuery>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Возвращает все категории пользователя.
   *
   * @param query - Запрос с UUID пользователя
   * @returns Список категорий, отсортированных по дате создания убывания
   */
  async execute(query: GetAllCategoriesQuery): Promise<Category[]> {
    return this.categoryRepository.findAllByUserId(query.userId);
  }
}

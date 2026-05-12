import {
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeleteCategoryCommand } from './delete-category.command';
import { CategoryRepository } from '../category.repository';
import { GetCategoryByIdQuery } from '../queries/get-category-by-id.query';

/**
 * Обработчик команды удаления категории.
 * Проверяет существование категории и право доступа пользователя.
 */
@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand>
{
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Выполняет удаление категории.
   *
   * @param command - ID категории и ID пользователя
   * @throws NotFoundException если категория не найдена
   * @throws ForbiddenException если категория принадлежит другому пользователю
   */
  async execute(command: DeleteCategoryCommand): Promise<void> {
    const { id, userId } = command;

    const category = await this.queryBus.execute(
      new GetCategoryByIdQuery(id),
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.categoryRepository.delete(id);
  }
}

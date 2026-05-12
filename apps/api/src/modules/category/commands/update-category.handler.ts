import {
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryCommand } from './update-category.command';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';
import { GetCategoryByIdQuery } from '../queries/get-category-by-id.query';

/**
 * Обработчик команды обновления категории.
 * Проверяет существование категории и право доступа пользователя.
 */
@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand>
{
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Выполняет обновление категории.
   *
   * @param command - ID категории, ID пользователя и поля для изменения
   * @returns Обновлённая категория
   * @throws NotFoundException если категория не найдена
   * @throws ForbiddenException если категория принадлежит другому пользователю
   */
  async execute(command: UpdateCategoryCommand): Promise<Category> {
    const { id, userId, data } = command;

    const category = await this.queryBus.execute(
      new GetCategoryByIdQuery(id),
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.categoryRepository.update(id, data);
  }
}

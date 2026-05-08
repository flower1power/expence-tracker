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

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand>
{
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly queryBus: QueryBus,
  ) {}

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

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

/** Обработчик команды создания категории. */
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Выполняет создание категории.
   *
   * @param command - Данные новой категории
   * @returns Созданная категория
   */
  async execute(command: CreateCategoryCommand): Promise<Category> {
    const { name, color, icon, userId } = command;
    return this.categoryRepository.create(name, color, icon, userId);
  }
}

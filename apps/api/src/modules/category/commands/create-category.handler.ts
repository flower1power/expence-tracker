import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCategoryCommand } from './create-category.command';
import { CategoryRepository } from '../category.repository';
import { Category } from '../entities/category.entity';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const { name, color, icon, userId } = command;
    return this.categoryRepository.create(name, color, icon, userId);
  }
}

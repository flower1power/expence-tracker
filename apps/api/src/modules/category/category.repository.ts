import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Category } from './entities/category.entity';

/** Репозиторий для работы с категориями через Prisma ORM. */
@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт новую категорию.
   *
   * @param name - Название категории
   * @param color - HEX-цвет категории
   * @param icon - Идентификатор иконки
   * @param userId - UUID владельца категории
   * @returns Созданная категория
   */
  async create(
    name: string,
    color: string,
    icon: string,
    userId: string,
  ): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name,
        color,
        icon,
        userId,
      },
    });
  }

  /**
   * Находит категорию по UUID.
   *
   * @param id - UUID категории
   * @returns Категория или null, если не найдена
   */
  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  /**
   * Возвращает все категории пользователя.
   *
   * @param userId - UUID пользователя
   * @returns Список категорий, отсортированных по дате создания убывания
   */
  async findAllByUserId(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Обновляет поля категории по UUID.
   *
   * @param id - UUID категории
   * @param data - Поля для обновления (все необязательны)
   * @returns Обновлённая категория
   */
  async update(
    id: string,
    data: Partial<Pick<Category, 'name' | 'color' | 'icon'>>,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Удаляет категорию по UUID.
   *
   * @param id - UUID категории
   */
  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
}

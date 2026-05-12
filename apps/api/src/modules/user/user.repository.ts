import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './entities/user.entity';

/** Репозиторий для работы с пользователями через Prisma ORM. */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт нового пользователя.
   *
   * @param email - Уникальный email пользователя
   * @param name - Имя пользователя
   * @param passwordHash - Bcrypt-хеш пароля
   * @returns Созданный пользователь
   */
  async create(email: string, name: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });
  }

  /**
   * Находит пользователя по email.
   *
   * @param email - Email пользователя
   * @returns Пользователь или null, если не найден
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Находит пользователя по UUID.
   *
   * @param id - UUID пользователя
   * @returns Пользователь или null, если не найден
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}

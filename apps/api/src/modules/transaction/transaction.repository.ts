import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Транзакция с данными связанной категории. */
export interface TransactionWithCategory {
  id: string;
  amount: Prisma.Decimal;
  type: TransactionType;
  description: string | null;
  date: Date;
  categoryId: string;
  userId: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

/** Критерии фильтрации при запросе списка транзакций. */
export interface TransactionFilter {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
}

/** Агрегированные данные по одной категории за период. */
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: Prisma.Decimal;
  type: TransactionType;
}

/** Финансовая сводка за месяц: итоги и разбивка по категориям. */
export interface TransactionSummary {
  totalIncome: Prisma.Decimal;
  totalExpense: Prisma.Decimal;
  byCategory: CategorySummary[];
}

/** Репозиторий для работы с транзакциями через Prisma ORM. */
@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создаёт новую транзакцию.
   *
   * @param amount - Сумма транзакции (минимум 0.01)
   * @param type - Тип транзакции: INCOME или EXPENSE
   * @param date - Дата совершения транзакции
   * @param categoryId - UUID категории
   * @param userId - UUID владельца транзакции
   * @param description - Необязательное описание
   * @returns Созданная транзакция с данными категории
   */
  async create(
    amount: number,
    type: TransactionType,
    date: Date,
    categoryId: string,
    userId: string,
    description?: string,
  ): Promise<TransactionWithCategory> {
    return this.prisma.transaction.create({
      data: {
        amount,
        type,
        date,
        categoryId,
        userId,
        description,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * Находит транзакцию по UUID.
   *
   * @param id - UUID транзакции
   * @returns Транзакция с данными категории или null, если не найдена
   */
  async findById(id: string): Promise<TransactionWithCategory | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * Возвращает все транзакции пользователя с возможностью фильтрации.
   *
   * @param userId - UUID пользователя
   * @param filter - Необязательные критерии фильтрации (диапазон дат, тип, категория)
   * @returns Список транзакций, отсортированных по дате убывания
   */
  async findAllByUserId(
    userId: string,
    filter?: TransactionFilter,
  ): Promise<TransactionWithCategory[]> {
    const where: Prisma.TransactionWhereInput = { userId };

    if (filter?.dateFrom || filter?.dateTo) {
      where.date = {};
      if (filter.dateFrom) {
        where.date.gte = filter.dateFrom;
      }
      if (filter.dateTo) {
        where.date.lte = filter.dateTo;
      }
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.categoryId) {
      where.categoryId = filter.categoryId;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Обновляет поля транзакции по UUID.
   *
   * @param id - UUID транзакции
   * @param data - Объект с полями для обновления (все необязательны)
   * @returns Обновлённая транзакция с данными категории
   */
  async update(
    id: string,
    data: {
      amount?: number;
      type?: TransactionType;
      description?: string;
      date?: Date;
      categoryId?: string;
    },
  ): Promise<TransactionWithCategory> {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  /**
   * Удаляет транзакцию по UUID.
   *
   * @param id - UUID транзакции
   */
  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }

  /**
   * Вычисляет финансовую сводку за конкретный месяц.
   * Использует сырой SQL для агрегации доходов и расходов по категориям.
   *
   * @param userId - UUID пользователя
   * @param year - Год (например, 2024)
   * @param month - Месяц (1–12)
   * @returns Объект с суммами доходов, расходов и разбивкой по категориям
   */
  async getSummaryByMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<TransactionSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [incomeResult, expenseResult, categoryResults] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.$queryRaw<CategorySummary[]>`
        SELECT
          c.id as "categoryId",
          c.name as "categoryName",
          c.color as "categoryColor",
          c.icon as "categoryIcon",
          SUM(t.amount) as "total",
          t.type as "type"
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ${userId}
          AND t.date >= ${startDate}
          AND t.date <= ${endDate}
        GROUP BY c.id, c.name, c.color, c.icon, t.type
        ORDER BY "total" DESC
      `,
    ]);

    return {
      totalIncome: incomeResult._sum.amount ?? new Prisma.Decimal(0),
      totalExpense: expenseResult._sum.amount ?? new Prisma.Decimal(0),
      byCategory: categoryResults,
    };
  }
}

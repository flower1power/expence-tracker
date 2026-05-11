import { Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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

export interface TransactionFilter {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: Prisma.Decimal;
  type: TransactionType;
}

export interface TransactionSummary {
  totalIncome: Prisma.Decimal;
  totalExpense: Prisma.Decimal;
  byCategory: CategorySummary[];
}

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }

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

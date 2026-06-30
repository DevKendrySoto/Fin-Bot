import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionQueryDto } from '../dto/transaction-query.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        categoryId: dto.categoryId,
        description: dto.description,
        transactionDate: new Date(dto.transactionDate),
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, query: TransactionQueryDto) {
    const { page = 1, limit = 20, type, categoryId, startDate, endDate, sort = '-createdAt' } = query;

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.transactionDate = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const orderBy = this.buildOrderBy(sort);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return transaction;
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    await this.findOne(id, userId);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.transactionDate && {
          transactionDate: new Date(dto.transactionDate),
        }),
      },
      include: { category: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.transaction.delete({ where: { id } });
  }

  async getBalance(userId: string) {
    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });

    const income = result.find((r) => r.type === 'Income')?._sum.amount ?? 0;
    const expenses = result.find((r) => r.type === 'Expense')?._sum.amount ?? 0;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      currentBalance: income - expenses,
      currency: user?.currency ?? 'RD$',
    };
  }

  async getSummary(userId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: start, lte: end },
      },
      include: { category: true },
    });

    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = Object.values(
      transactions
        .filter((t) => t.type === 'Expense')
        .reduce<Record<string, { name: string; amount: number; count: number }>>(
          (acc, t) => {
            const key = t.categoryId;
            if (!acc[key]) {
              acc[key] = { name: t.category.name, amount: 0, count: 0 };
            }
            acc[key].amount += t.amount;
            acc[key].count += 1;
            return acc;
          },
          {},
        ),
    ).map((c) => ({
      ...c,
      percentage: expenses > 0 ? Math.round((c.amount / expenses) * 100) : 0,
    }));

    return {
      period: { month, year },
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      transactionCount: transactions.length,
      byCategory,
    };
  }

  private buildOrderBy(sort: string) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    const allowed = ['createdAt', 'amount', 'transactionDate'];
    const key = allowed.includes(field) ? field : 'createdAt';
    return { [key]: desc ? 'desc' : 'asc' } as const;
  }
}

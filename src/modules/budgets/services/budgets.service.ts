import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateBudgetDto } from '../dto/create-budget.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';

export type BudgetStatus = 'within_limit' | 'warning' | 'exceeded';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    });

    return Promise.all(budgets.map((b) => this.enrichBudget(b, userId)));
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.userId !== userId) throw new ForbiddenException('Access denied');

    return this.enrichBudget(budget, userId);
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({
      where: { userId, categoryId: dto.categoryId },
    });
    if (existing) {
      throw new ConflictException('A budget for this category already exists');
    }

    const budget = await this.prisma.budget.create({
      data: { ...dto, userId },
      include: { category: true },
    });

    return this.enrichBudget(budget, userId);
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    await this.findOne(id, userId);

    const budget = await this.prisma.budget.update({
      where: { id },
      data: dto,
      include: { category: true },
    });

    return this.enrichBudget(budget, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.budget.delete({ where: { id } });
  }

  // Checks if any budget threshold is crossed and returns alert data
  async checkThresholds(userId: string, categoryId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { userId, categoryId },
    });
    if (!budget) return null;

    const spent = await this.getCurrentSpent(userId, categoryId);
    const percentage = Math.round((spent / budget.monthlyLimit) * 100);

    if (percentage >= 100) return { budget, percentage, level: 'exceeded' as const };
    if (percentage >= 80) return { budget, percentage, level: 'warning' as const };
    if (percentage >= 50) return { budget, percentage, level: 'halfway' as const };

    return null;
  }

  private async enrichBudget(
    budget: any,
    userId: string,
  ) {
    const spent = await this.getCurrentSpent(userId, budget.categoryId);
    const percentage = budget.monthlyLimit > 0
      ? Math.round((spent / budget.monthlyLimit) * 100)
      : 0;

    const status: BudgetStatus =
      percentage >= 100 ? 'exceeded' :
      percentage >= 80  ? 'warning'  :
                          'within_limit';

    return { ...budget, currentSpent: spent, percentageUsed: percentage, status };
  }

  private async getCurrentSpent(userId: string, categoryId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'Expense',
        transactionDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyReport(userId: string, week?: number, year?: number) {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();

    // Calculate start/end of the given ISO week
    const { start, end } = week
      ? this.getWeekRange(targetYear, week)
      : this.getCurrentWeekRange(now);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { transactionDate: 'desc' },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);

    const categoryTotals = transactions
      .filter((t) => t.type === 'Expense')
      .reduce<Record<string, { name: string; amount: number }>>((acc, t) => {
        if (!acc[t.categoryId]) acc[t.categoryId] = { name: t.category.name, amount: 0 };
        acc[t.categoryId].amount += t.amount;
        return acc;
      }, {});

    const largestCategory = Object.values(categoryTotals).sort(
      (a, b) => b.amount - a.amount,
    )[0] ?? null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    return {
      period: { start, end },
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      largestCategory,
      currency: user?.currency ?? 'RD$',
    };
  }

  async getMonthlyReport(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Previous month for comparison
    const prevStart = new Date(targetYear, targetMonth - 2, 1);
    const prevEnd = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59);

    const [transactions, prevTransactions, user] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, transactionDate: { gte: start, lte: end } },
        include: { category: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, transactionDate: { gte: prevStart, lte: prevEnd } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { currency: true },
      }),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevExpenses = prevTransactions
      .filter((t) => t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);

    const prevIncome = prevTransactions
      .filter((t) => t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);

    const byCategory = Object.values(
      transactions
        .filter((t) => t.type === 'Expense')
        .reduce<Record<string, { name: string; icon: string; amount: number; count: number }>>(
          (acc, t) => {
            const key = t.categoryId;
            if (!acc[key]) acc[key] = { name: t.category.name, icon: t.category.icon, amount: 0, count: 0 };
            acc[key].amount += t.amount;
            acc[key].count += 1;
            return acc;
          },
          {},
        ),
    )
      .map((c) => ({
        ...c,
        percentage: totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const recommendations = this.buildRecommendations(
      totalExpenses,
      prevExpenses,
      totalIncome,
      byCategory,
    );

    return {
      period: {
        month: targetMonth,
        year: targetYear,
        label: start.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      },
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      byCategory,
      comparison: {
        prevIncome,
        prevExpenses,
        incomeChange: prevIncome > 0
          ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100)
          : 0,
        expenseChange: prevExpenses > 0
          ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100)
          : 0,
      },
      recommendations,
      currency: user?.currency ?? 'RD$',
    };
  }

  private buildRecommendations(
    totalExpenses: number,
    prevExpenses: number,
    totalIncome: number,
    byCategory: { name: string; amount: number; percentage: number }[],
  ): string[] {
    const tips: string[] = [];

    if (prevExpenses > 0 && totalExpenses > prevExpenses * 1.1) {
      const pct = Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100);
      tips.push(`Your expenses increased by ${pct}% compared to last month.`);
    }

    if (totalIncome > 0 && totalExpenses / totalIncome > 0.8) {
      tips.push('You spent over 80% of your income this month. Consider reviewing your budget.');
    }

    const top = byCategory[0];
    if (top && top.percentage > 40) {
      tips.push(`${top.name} represents ${top.percentage}% of your expenses — the largest category.`);
    }

    if (totalIncome > totalExpenses) {
      const saved = totalIncome - totalExpenses;
      tips.push(`Great job! You saved ${saved.toFixed(2)} this month.`);
    }

    return tips;
  }

  private getCurrentWeekRange(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private getWeekRange(year: number, week: number) {
    const jan4 = new Date(year, 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const start = new Date(startOfWeek1);
    start.setDate(startOfWeek1.getDate() + (week - 1) * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}

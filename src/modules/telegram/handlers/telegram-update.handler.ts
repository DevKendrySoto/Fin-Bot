import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionsService } from 'src/modules/transactions/services/transactions.service';
import { ReportsService } from 'src/modules/reports/services/reports.service';
import { Context } from 'telegraf';
import { TransactionType } from 'src/modules/transactions/dto/create-transaction.dto';

@Injectable()
export class TelegramUpdateHandler implements OnModuleInit {
  private readonly logger = new Logger(TelegramUpdateHandler.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
    private readonly reportsService: ReportsService,
  ) {}

  onModuleInit() {
    const bot = this.telegramService.getBot();

    bot.start((ctx) => this.handleStart(ctx));
    bot.command('balance', (ctx) => this.handleBalance(ctx));
    bot.command('expenses', (ctx) => this.handleExpenses(ctx));
    bot.command('income', (ctx) => this.handleIncome(ctx));
    bot.command('summary', (ctx) => this.handleSummary(ctx));
    bot.command('history', (ctx) => this.handleHistory(ctx));
    bot.command('help', (ctx) => this.handleHelp(ctx));
    bot.on('text', (ctx) => this.handleText(ctx));
  }

  // ─── Command Handlers ───────────────────────────────────────────

  private async handleStart(ctx: Context) {
    const telegramId = String(ctx.from!.id);
    const name = ctx.from!.first_name;

    let user = await this.prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          name,
          currency: 'RD$',
          timezone: 'America/Santo_Domingo',
        },
      });
      await ctx.reply(
        `👋 Welcome to <b>FinBot</b>, ${name}!\n\n` +
        `Your account has been created. Here's what you can do:\n\n` +
        this.getCommandList(),
        { parse_mode: 'HTML' },
      );
    } else {
      await ctx.reply(
        `👋 Welcome back, <b>${user.name}</b>!\n\n${this.getCommandList()}`,
        { parse_mode: 'HTML' },
      );
    }
  }

  private async handleBalance(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const balance = await this.transactionsService.getBalance(user.id);

    await ctx.reply(
      `💰 <b>Your Balance</b>\n\n` +
      `📈 Income:  <b>${balance.currency} ${balance.totalIncome.toFixed(2)}</b>\n` +
      `📉 Expenses: <b>${balance.currency} ${balance.totalExpenses.toFixed(2)}</b>\n` +
      `━━━━━━━━━━━━━━\n` +
      `🏦 Balance: <b>${balance.currency} ${balance.currentBalance.toFixed(2)}</b>`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleExpenses(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      type: TransactionType.EXPENSE,
      limit: 5,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('No expenses recorded yet.');
      return;
    }

    const lines = data.map(
      (t: any) =>
        `• ${t.category.icon} <b>${t.description}</b> — ${t.amount.toFixed(2)}\n  <i>${new Date(t.transactionDate).toLocaleDateString()}</i>`,
    );

    await ctx.reply(
      `📉 <b>Recent Expenses</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleIncome(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      type: TransactionType.INCOME,
      limit: 5,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('No income recorded yet.');
      return;
    }

    const lines = data.map(
      (t: any) =>
        `• 💵 <b>${t.description}</b> — ${t.amount.toFixed(2)}\n  <i>${new Date(t.transactionDate).toLocaleDateString()}</i>`,
    );

    await ctx.reply(
      `📈 <b>Recent Income</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleSummary(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const now = new Date();
    const report = await this.reportsService.getMonthlyReport(
      user.id,
      now.getMonth() + 1,
      now.getFullYear(),
    );

    const topCategories = report.byCategory
      .slice(0, 3)
      .map((c: any) => `  ${c.icon ?? '📦'} ${c.name}: ${c.amount.toFixed(2)} (${c.percentage}%)`)
      .join('\n');

    const recommendations = report.recommendations.length
      ? '\n\n💡 <b>Tips</b>\n' + report.recommendations.map((r: string) => `• ${r}`).join('\n')
      : '';

    await ctx.reply(
      `📊 <b>Monthly Summary — ${report.period.label}</b>\n\n` +
      `📈 Income:   <b>${report.currency} ${report.totalIncome.toFixed(2)}</b>\n` +
      `📉 Expenses: <b>${report.currency} ${report.totalExpenses.toFixed(2)}</b>\n` +
      `💰 Saved:    <b>${report.currency} ${report.netIncome.toFixed(2)}</b>\n\n` +
      `<b>Top Categories:</b>\n${topCategories || '  No expenses yet'}` +
      recommendations,
      { parse_mode: 'HTML' },
    );
  }

  private async handleHistory(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      limit: 10,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('No transactions recorded yet.');
      return;
    }

    const lines = data.map((t: any) => {
      const emoji = t.type === 'Income' ? '📈' : '📉';
      return `${emoji} <b>${t.description}</b>\n  ${t.amount.toFixed(2)} • ${t.category.icon} ${t.category.name} • <i>${new Date(t.transactionDate).toLocaleDateString()}</i>`;
    });

    await ctx.reply(
      `📋 <b>Last 10 Transactions</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleHelp(ctx: Context) {
    await ctx.reply(this.getCommandList(), { parse_mode: 'HTML' });
  }

  // ─── Natural Language Handler ────────────────────────────────────

  private async handleText(ctx: Context) {
    if (!('text' in ctx.message!)) return;
    const text = (ctx.message as any).text as string;

    const expenseMatch = this.parseExpense(text);
    const incomeMatch = this.parseIncome(text);

    if (expenseMatch) {
      await this.registerTransaction(ctx, expenseMatch.amount, expenseMatch.description, 'Expense');
    } else if (incomeMatch) {
      await this.registerTransaction(ctx, incomeMatch.amount, incomeMatch.description, 'Income');
    } else {
      await ctx.reply(
        `I didn't understand that. Try:\n` +
        `• "I spent 850 on groceries"\n` +
        `• "Paid 1200 for transport"\n` +
        `• "I received 45000 salary"\n\n` +
        `Or use /help to see all commands.`,
      );
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private parseExpense(text: string) {
    const patterns = [
      /(?:spent|paid|pay|bought|spend)\s+(\d+(?:[.,]\d+)?)\s+(?:on\s+|for\s+)?(.+)/i,
      /(.+?)\s+(?:bill|cost|fee)\s+(\d+(?:[.,]\d+)?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(',', '.'));
        const description = match[2]?.trim() ?? match[1]?.trim();
        if (!isNaN(amount)) return { amount, description };
      }
    }
    return null;
  }

  private parseIncome(text: string) {
    const pattern = /(?:received|got|earned|income|salary|freelance)\s+(?:of\s+)?(\d+(?:[.,]\d+)?)\s*(.+)?/i;
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      const description = match[2]?.trim() ?? 'Income';
      if (!isNaN(amount)) return { amount, description };
    }
    return null;
  }

  private async registerTransaction(
    ctx: Context,
    amount: number,
    description: string,
    type: 'Income' | 'Expense',
  ) {
    const user = await this.getUser(ctx);
    if (!user) return;

    // Find a default category
    const categoryName = type === 'Income' ? 'Other Income' : 'Other Expense';
    const category = await this.prisma.category.findFirst({
      where: { name: categoryName, userId: null },
    });

    if (!category) {
      await ctx.reply('❌ No default categories found. Please run the seed first.');
      return;
    }

    await this.transactionsService.create(user.id, {
      type: type as TransactionType,
      amount,
      categoryId: category.id,
      description,
      transactionDate: new Date().toISOString(),
    });

    const emoji = type === 'Income' ? '📈' : '📉';
    await ctx.reply(
      `${emoji} <b>${type} registered!</b>\n\n` +
      `📝 ${description}\n` +
      `💵 ${user.currency} ${amount.toFixed(2)}\n` +
      `📅 ${new Date().toLocaleDateString()}\n\n` +
      `Use /balance to see your current balance.`,
      { parse_mode: 'HTML' },
    );
  }

  private async getUser(ctx: Context) {
    const telegramId = String(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      await ctx.reply('Please send /start to register first.');
      return null;
    }
    return user;
  }

  private getCommandList(): string {
    return (
      `<b>Available Commands:</b>\n\n` +
      `/balance — View current balance\n` +
      `/expenses — Recent expenses\n` +
      `/income — Recent income\n` +
      `/history — Last 10 transactions\n` +
      `/summary — Monthly summary\n` +
      `/help — Show this menu\n\n` +
      `<b>Natural Language:</b>\n` +
      `• "I spent 850 on groceries"\n` +
      `• "Paid 1200 for transport"\n` +
      `• "I received 45000 salary"`
    );
  }
}

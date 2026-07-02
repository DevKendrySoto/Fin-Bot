import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionsService } from 'src/modules/transactions/services/transactions.service';
import { ReportsService } from 'src/modules/reports/services/reports.service';
import { Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { TransactionType } from 'src/modules/transactions/dto/create-transaction.dto';

@Injectable()
export class TelegramUpdateHandler implements OnModuleInit {

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
    bot.command('gastos', (ctx) => this.handleGastos(ctx));
    bot.command('ingresos', (ctx) => this.handleIngresos(ctx));
    bot.command('resumen', (ctx) => this.handleResumen(ctx));
    bot.command('historial', (ctx) => this.handleHistorial(ctx));
    bot.command('ayuda', (ctx) => this.handleAyuda(ctx));
    bot.on(message('text'), (ctx) => this.handleText(ctx));
  }

  // ─── Comandos ───────────────────────────────────────────────────

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
        `👋 ¡Bienvenido a <b>FinBot</b>, ${name}!\n\n` +
        `Tu cuenta ha sido creada exitosamente. Aquí te explico qué puedes hacer:\n\n` +
        this.getCommandList(),
        { parse_mode: 'HTML' },
      );
    } else {
      await ctx.reply(
        `👋 ¡Bienvenido de nuevo, <b>${user.name}</b>!\n\n${this.getCommandList()}`,
        { parse_mode: 'HTML' },
      );
    }
  }

  private async handleBalance(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const balance = await this.transactionsService.getBalance(user.id);

    await ctx.reply(
      `💰 <b>Tu Balance Actual</b>\n\n` +
      `📈 Ingresos:  <b>${balance.currency} ${balance.totalIncome.toFixed(2)}</b>\n` +
      `📉 Gastos:    <b>${balance.currency} ${balance.totalExpenses.toFixed(2)}</b>\n` +
      `━━━━━━━━━━━━━━\n` +
      `🏦 Balance:  <b>${balance.currency} ${balance.currentBalance.toFixed(2)}</b>`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleGastos(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      type: TransactionType.EXPENSE,
      limit: 5,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('Aún no tienes gastos registrados.');
      return;
    }

    const lines = data.map(
      (t: any) =>
        `• ${t.category.icon} <b>${t.description}</b> — ${t.amount.toFixed(2)}\n  <i>${new Date(t.transactionDate).toLocaleDateString('es-DO')}</i>`,
    );

    await ctx.reply(
      `📉 <b>Últimos Gastos</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleIngresos(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      type: TransactionType.INCOME,
      limit: 5,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('Aún no tienes ingresos registrados.');
      return;
    }

    const lines = data.map(
      (t: any) =>
        `• 💵 <b>${t.description}</b> — ${t.amount.toFixed(2)}\n  <i>${new Date(t.transactionDate).toLocaleDateString('es-DO')}</i>`,
    );

    await ctx.reply(
      `📈 <b>Últimos Ingresos</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleResumen(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const now = new Date();
    const report = await this.reportsService.getMonthlyReport(
      user.id,
      now.getMonth() + 1,
      now.getFullYear(),
    );

    const topCategorias = report.byCategory
      .slice(0, 3)
      .map((c: any) => `  ${c.icon ?? '📦'} ${c.name}: ${c.amount.toFixed(2)} (${c.percentage}%)`)
      .join('\n');

    const recomendaciones = report.recommendations.length
      ? '\n\n💡 <b>Consejos</b>\n' + report.recommendations.map((r: string) => `• ${r}`).join('\n')
      : '';

    await ctx.reply(
      `📊 <b>Resumen Mensual — ${report.period.label}</b>\n\n` +
      `📈 Ingresos:  <b>${report.currency} ${report.totalIncome.toFixed(2)}</b>\n` +
      `📉 Gastos:    <b>${report.currency} ${report.totalExpenses.toFixed(2)}</b>\n` +
      `💰 Ahorrado: <b>${report.currency} ${report.netIncome.toFixed(2)}</b>\n\n` +
      `<b>Principales Categorías:</b>\n${topCategorias || '  Sin gastos aún'}` +
      recomendaciones,
      { parse_mode: 'HTML' },
    );
  }

  private async handleHistorial(ctx: Context) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const { data } = await this.transactionsService.findAll(user.id, {
      limit: 10,
      page: 1,
    });

    if (!data.length) {
      await ctx.reply('Aún no tienes transacciones registradas.');
      return;
    }

    const lines = data.map((t: any) => {
      const emoji = t.type === 'Income' ? '📈' : '📉';
      return `${emoji} <b>${t.description}</b>\n  ${t.amount.toFixed(2)} • ${t.category.icon} ${t.category.name} • <i>${new Date(t.transactionDate).toLocaleDateString('es-DO')}</i>`;
    });

    await ctx.reply(
      `📋 <b>Últimas 10 Transacciones</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
  }

  private async handleAyuda(ctx: Context) {
    await ctx.reply(this.getCommandList(), { parse_mode: 'HTML' });
  }

  // ─── Lenguaje Natural ────────────────────────────────────────────

  private async handleText(ctx: Context) {
    if (!('text' in ctx.message!)) return;
    const text = (ctx.message as any).text as string;

    const gastoMatch = this.parseGasto(text);
    const ingresoMatch = this.parseIngreso(text);

    if (gastoMatch) {
      await this.registrarTransaccion(ctx, gastoMatch.monto, gastoMatch.descripcion, 'Expense');
    } else if (ingresoMatch) {
      await this.registrarTransaccion(ctx, ingresoMatch.monto, ingresoMatch.descripcion, 'Income');
    } else {
      await ctx.reply(
        `No entendí ese mensaje. Intenta así:\n\n` +
        `📉 <b>Para gastos:</b>\n` +
        `• "Gasté 850 en supermercado"\n` +
        `• "Pagué 1200 de transporte"\n` +
        `• "Internet 1800"\n\n` +
        `📈 <b>Para ingresos:</b>\n` +
        `• "Recibí mi sueldo de 45000"\n` +
        `• "Cobré freelance 15000"\n\n` +
        `Usa /ayuda para ver todos los comandos.`,
        { parse_mode: 'HTML' },
      );
    }
  }

  // ─── Parsers de lenguaje natural ─────────────────────────────────

  private parseGasto(text: string) {
    const patrones = [
      // Español: "Gasté 850 en supermercado", "Pagué 1200 de transporte"
      /(?:gasté|gaste|pagué|pague|compré|compre|gasté|invertí|invertí)\s+(\d+(?:[.,]\d+)?)\s+(?:en\s+|de\s+|por\s+)?(.+)/i,
      // Sin verbo: "Supermercado 850", "Internet 1800"
      /^([A-Za-záéíóúÁÉÍÓÚñÑ][A-Za-záéíóúÁÉÍÓÚñÑ\s]+?)\s+(\d+(?:[.,]\d+)?)$/i,
    ];

    for (const patron of patrones) {
      const match = text.match(patron);
      if (match) {
        // El primer patrón tiene monto en [1], el segundo en [2]
        const montoStr = patron === patrones[0] ? match[1] : match[2];
        const descripcion = patron === patrones[0] ? match[2]?.trim() : match[1]?.trim();
        const monto = parseFloat(montoStr.replace(',', '.'));
        if (!isNaN(monto) && descripcion) return { monto, descripcion };
      }
    }
    return null;
  }

  private parseIngreso(text: string) {
    const patron = /(?:recibí|recibi|cobré|cobre|gané|gane|ingresé|ingrese|sueldo|salario|pago|freelance)\s+(?:de\s+|mi\s+|el\s+)?(\d+(?:[.,]\d+)?)\s*(.+)?/i;
    const match = text.match(patron);
    if (match) {
      const monto = parseFloat(match[1].replace(',', '.'));
      const descripcion = match[2]?.trim() || text.split(/\d/)[0].trim() || 'Ingreso';
      if (!isNaN(monto)) return { monto, descripcion };
    }
    return null;
  }

  private async registrarTransaccion(
    ctx: Context,
    monto: number,
    descripcion: string,
    tipo: 'Income' | 'Expense',
  ) {
    const user = await this.getUser(ctx);
    if (!user) return;

    const nombreCategoria = tipo === 'Income' ? 'Other Income' : 'Other Expense';
    const categoria = await this.prisma.category.findFirst({
      where: { name: nombreCategoria, userId: null },
    });

    if (!categoria) {
      await ctx.reply('❌ No se encontraron categorías. Ejecuta el seed primero.');
      return;
    }

    await this.transactionsService.create(user.id, {
      type: tipo as TransactionType,
      amount: monto,
      categoryId: categoria.id,
      description: descripcion,
      transactionDate: new Date().toISOString(),
    });

    const emoji = tipo === 'Income' ? '📈' : '📉';
    const label = tipo === 'Income' ? '¡Ingreso registrado!' : '¡Gasto registrado!';

    await ctx.reply(
      `${emoji} <b>${label}</b>\n\n` +
      `📝 ${descripcion}\n` +
      `💵 ${user.currency} ${monto.toFixed(2)}\n` +
      `📅 ${new Date().toLocaleDateString('es-DO')}\n\n` +
      `Usa /balance para ver tu balance actual.`,
      { parse_mode: 'HTML' },
    );
  }

  private async getUser(ctx: Context) {
    const telegramId = String(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { telegramId } });

    if (!user) {
      await ctx.reply('Envía /start para registrarte primero.');
      return null;
    }
    return user;
  }

  private getCommandList(): string {
    return (
      `<b>📋 Comandos disponibles:</b>\n\n` +
      `/balance — Ver tu balance actual\n` +
      `/gastos — Últimos gastos\n` +
      `/ingresos — Últimos ingresos\n` +
      `/historial — Últimas 10 transacciones\n` +
      `/resumen — Resumen mensual\n` +
      `/ayuda — Ver este menú\n\n` +
      `<b>💬 También puedes escribir naturalmente:</b>\n` +
      `📉 "Gasté 850 en supermercado"\n` +
      `📉 "Pagué 1200 de transporte"\n` +
      `📉 "Internet 1800"\n` +
      `📈 "Recibí mi sueldo de 45000"\n` +
      `📈 "Cobré freelance 15000"`
    );
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    const webhookUrl = this.config.get<string>('TELEGRAM_WEBHOOK_URL');
    const env = this.config.get<string>('NODE_ENV');

    if (env === 'production' && webhookUrl) {
      await this.bot.telegram.setWebhook(`${webhookUrl}/api/bot/webhook`);
      this.logger.log(`Webhook set to ${webhookUrl}/api/bot/webhook`);
    } else {
      this.logger.log('Running in polling mode (development)');
      this.bot.launch().catch((err) => this.logger.error('Bot launch failed', err));
    }
  }

  getBot(): Telegraf {
    return this.bot;
  }

  async sendMessage(telegramId: string, text: string, extra?: object) {
    try {
      await this.bot.telegram.sendMessage(telegramId, text, {
        parse_mode: 'HTML',
        ...extra,
      });
    } catch (err) {
      this.logger.error(`Failed to send message to ${telegramId}`, err);
    }
  }

  async processUpdate(body: object) {
    await this.bot.handleUpdate(body as any);
  }
}

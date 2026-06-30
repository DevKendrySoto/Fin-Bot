import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { ConfigService } from '@nestjs/config';

@Controller('bot')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: object,
    @Headers('x-telegram-bot-api-secret-token') secret: string,
  ) {
    const expectedSecret = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET');

    // Validate secret token if configured
    if (expectedSecret && secret !== expectedSecret) {
      return;
    }

    await this.telegramService.processUpdate(body);
  }
}

import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram.service';
import { TelegramController } from './controllers/telegram.controller';
import { TelegramUpdateHandler } from './handlers/telegram-update.handler';
import { PrismaModule } from 'src/database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';
import { ReportsModule } from '../reports/reports.module';
import { PaymentRemindersModule } from '../payment-reminders/payment-reminders.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    ReportsModule,
    PaymentRemindersModule,
  ],
  providers: [TelegramService, TelegramUpdateHandler],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}

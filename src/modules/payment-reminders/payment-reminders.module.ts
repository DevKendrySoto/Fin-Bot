import { Module } from '@nestjs/common';
import { PaymentRemindersService } from './services/payment-reminders.service';
import { PaymentRemindersController } from './controllers/payment-reminders.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentRemindersService],
  controllers: [PaymentRemindersController],
  exports: [PaymentRemindersService],
})
export class PaymentRemindersModule {}

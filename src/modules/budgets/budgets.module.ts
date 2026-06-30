import { Module } from '@nestjs/common';
import { BudgetsService } from './services/budgets.service';
import { BudgetsController } from './controllers/budgets.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BudgetsService],
  controllers: [BudgetsController],
  exports: [BudgetsService],
})
export class BudgetsModule {}

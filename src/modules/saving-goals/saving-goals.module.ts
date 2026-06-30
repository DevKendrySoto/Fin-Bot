import { Module } from '@nestjs/common';
import { SavingGoalsService } from './services/saving-goals.service';
import { SavingGoalsController } from './controllers/saving-goals.controller';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SavingGoalsService],
  controllers: [SavingGoalsController],
  exports: [SavingGoalsService],
})
export class SavingGoalsModule {}

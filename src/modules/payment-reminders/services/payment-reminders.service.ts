import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreatePaymentReminderDto } from '../dto/create-payment-reminder.dto';
import { UpdatePaymentReminderDto } from '../dto/update-payment-reminder.dto';

@Injectable()
export class PaymentRemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.paymentReminder.findMany({
      where: { userId },
      orderBy: { paymentDay: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const reminder = await this.prisma.paymentReminder.findUnique({
      where: { id },
    });

    if (!reminder) throw new NotFoundException('Payment reminder not found');
    if (reminder.userId !== userId) throw new ForbiddenException('Access denied');

    return reminder;
  }

  async create(userId: string, dto: CreatePaymentReminderDto) {
    return this.prisma.paymentReminder.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdatePaymentReminderDto) {
    await this.findOne(id, userId);
    return this.prisma.paymentReminder.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.paymentReminder.delete({ where: { id } });
  }

  async markCompleted(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.paymentReminder.update({
      where: { id },
      data: { lastCompletedAt: new Date() },
    });
  }

  // Called by the scheduler to get upcoming reminders
  async getUpcoming(daysAhead: number = 3) {
    const today = new Date();
    const targetDay = today.getDate() + daysAhead;

    return this.prisma.paymentReminder.findMany({
      where: {
        active: true,
        paymentDay: { lte: targetDay },
        OR: [
          { lastCompletedAt: null },
          {
            lastCompletedAt: {
              lt: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        ],
      },
      include: { user: { select: { telegramId: true, name: true, currency: true } } },
    });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PaymentRemindersService } from './payment-reminders.service';
import { PrismaService } from 'src/database/prisma.service';
import { ReminderFrequency } from '../dto/create-payment-reminder.dto';

const userId = 'user-123';
const reminderId = 'rem-123';

const mockReminder = {
  id: reminderId,
  userId,
  serviceName: 'Internet',
  amount: 1800,
  paymentDay: 15,
  frequency: 'monthly',
  active: true,
  lastCompletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PaymentRemindersService', () => {
  let service: PaymentRemindersService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRemindersService,
        {
          provide: PrismaService,
          useValue: {
            paymentReminder: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PaymentRemindersService>(PaymentRemindersService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all reminders for user', async () => {
      prisma.paymentReminder.findMany.mockResolvedValue([mockReminder]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(prisma.paymentReminder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a reminder', async () => {
      prisma.paymentReminder.findUnique.mockResolvedValue(mockReminder);

      const result = await service.findOne(reminderId, userId);
      expect(result).toEqual(mockReminder);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.paymentReminder.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for other user reminder', async () => {
      prisma.paymentReminder.findUnique.mockResolvedValue({
        ...mockReminder,
        userId: 'other-user',
      });

      await expect(service.findOne(reminderId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a payment reminder', async () => {
      prisma.paymentReminder.create.mockResolvedValue(mockReminder);

      const result = await service.create(userId, {
        serviceName: 'Internet',
        amount: 1800,
        paymentDay: 15,
        frequency: ReminderFrequency.MONTHLY,
      });

      expect(result).toEqual(mockReminder);
      expect(prisma.paymentReminder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId, serviceName: 'Internet' }),
      });
    });
  });

  describe('markCompleted', () => {
    it('should mark reminder as completed', async () => {
      const completed = { ...mockReminder, lastCompletedAt: new Date() };
      prisma.paymentReminder.findUnique.mockResolvedValue(mockReminder);
      prisma.paymentReminder.update.mockResolvedValue(completed);

      const result = await service.markCompleted(reminderId, userId);

      expect(result.lastCompletedAt).not.toBeNull();
      expect(prisma.paymentReminder.update).toHaveBeenCalledWith({
        where: { id: reminderId },
        data: expect.objectContaining({ lastCompletedAt: expect.any(Date) }),
      });
    });
  });

  describe('remove', () => {
    it('should delete a reminder', async () => {
      prisma.paymentReminder.findUnique.mockResolvedValue(mockReminder);
      prisma.paymentReminder.delete.mockResolvedValue(mockReminder);

      await service.remove(reminderId, userId);

      expect(prisma.paymentReminder.delete).toHaveBeenCalledWith({
        where: { id: reminderId },
      });
    });
  });
});

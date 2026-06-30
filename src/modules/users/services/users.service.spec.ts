import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/database/prisma.service';

const mockUser = {
  id: 'user-123',
  telegramId: '123456789',
  name: 'Test User',
  currency: 'RD$',
  timezone: 'America/Santo_Domingo',
  createdAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            transaction: { count: jest.fn() },
            paymentReminder: { count: jest.fn() },
            savingGoal: { count: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException for unknown user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const updated = { ...mockUser, name: 'New Name' };
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.user.update = jest.fn().mockResolvedValue(updated);

      const result = await service.updateProfile('user-123', {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException for unknown user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return user stats', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.transaction.count = jest.fn().mockResolvedValue(10);
      prisma.paymentReminder.count = jest.fn().mockResolvedValue(3);
      prisma.savingGoal.count = jest.fn().mockResolvedValue(2);

      const result = await service.getStats('user-123');

      expect(result).toEqual({
        transactionCount: 10,
        activeReminders: 3,
        savingGoals: 2,
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.user.delete = jest.fn().mockResolvedValue(mockUser);

      await service.deleteAccount('user-123');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException for unknown user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deleteAccount('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

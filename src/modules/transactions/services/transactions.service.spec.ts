import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionType } from '../dto/create-transaction.dto';

const userId = 'user-123';
const transactionId = 'tx-123';

const mockCategory = {
  id: 'cat-123',
  name: 'Groceries',
  icon: '🛒',
  color: '#FF5733',
  type: 'Expense',
  userId: null,
};

const mockTransaction = {
  id: transactionId,
  userId,
  type: 'Expense',
  amount: 5000,
  categoryId: 'cat-123',
  category: mockCategory,
  description: 'Grocery shopping',
  transactionDate: new Date('2024-01-15'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      prisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(userId, {
        type: TransactionType.EXPENSE,
        amount: 5000,
        categoryId: 'cat-123',
        description: 'Grocery shopping',
        transactionDate: '2024-01-15',
      });

      expect(result).toEqual(mockTransaction);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          amount: 5000,
          type: 'Expense',
        }),
        include: { category: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.transaction.count.mockResolvedValue(1);

      const result = await service.findAll(userId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      });
    });

    it('should filter by type', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.findAll(userId, { type: TransactionType.EXPENSE });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'Expense' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.findAll(userId, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionDate: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.findOne(transactionId, userId);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user does not own transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        userId: 'other-user',
      });

      await expect(service.findOne(transactionId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const updated = { ...mockTransaction, amount: 6000 };
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.transaction.update.mockResolvedValue(updated);

      const result = await service.update(transactionId, userId, {
        amount: 6000,
      });

      expect(result.amount).toBe(6000);
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.transaction.delete.mockResolvedValue(mockTransaction);

      await service.remove(transactionId, userId);

      expect(prisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
    });
  });

  describe('getBalance', () => {
    it('should return correct balance', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'Income', _sum: { amount: 50000 } },
        { type: 'Expense', _sum: { amount: 15000 } },
      ]);
      prisma.user.findUnique.mockResolvedValue({ currency: 'RD$' });

      const result = await service.getBalance(userId);

      expect(result).toEqual({
        totalIncome: 50000,
        totalExpenses: 15000,
        currentBalance: 35000,
        currency: 'RD$',
      });
    });

    it('should return zero balance when no transactions', async () => {
      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.user.findUnique.mockResolvedValue({ currency: 'RD$' });

      const result = await service.getBalance(userId);

      expect(result.currentBalance).toBe(0);
    });
  });

  describe('getSummary', () => {
    it('should return monthly summary with category breakdown', async () => {
      const transactions = [
        { ...mockTransaction, type: 'Income', amount: 50000, category: { name: 'Salary' } },
        { ...mockTransaction, type: 'Expense', amount: 5000, category: { name: 'Groceries' } },
        { ...mockTransaction, type: 'Expense', amount: 3000, category: { name: 'Food' }, categoryId: 'cat-456' },
      ];
      prisma.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getSummary(userId, 1, 2024);

      expect(result.totalIncome).toBe(50000);
      expect(result.totalExpenses).toBe(8000);
      expect(result.netIncome).toBe(42000);
      expect(result.byCategory).toHaveLength(2);
    });
  });
});

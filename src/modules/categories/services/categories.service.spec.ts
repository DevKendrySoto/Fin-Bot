import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'src/database/prisma.service';

const userId = 'user-123';

const mockGlobalCategory = {
  id: 'cat-global-1',
  name: 'Groceries',
  icon: '🛒',
  color: '#FF5733',
  type: 'Expense',
  userId: null,
};

const mockUserCategory = {
  id: 'cat-user-1',
  name: 'My Category',
  icon: '⭐',
  color: '#123456',
  type: 'Expense',
  userId,
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            transaction: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return global and user categories', async () => {
      prisma.category.findMany.mockResolvedValue([
        mockGlobalCategory,
        mockUserCategory,
      ]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(2);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ userId: null }, { userId }] },
        }),
      );
    });

    it('should filter by type', async () => {
      prisma.category.findMany.mockResolvedValue([mockGlobalCategory]);

      await service.findAll(userId, 'Expense');

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'Expense' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockGlobalCategory);

      const result = await service.findOne('cat-global-1');

      expect(result).toEqual(mockGlobalCategory);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a custom category', async () => {
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockUserCategory);

      const result = await service.create(userId, {
        name: 'My Category',
        icon: '⭐',
        color: '#123456',
        type: 'Expense' as any,
      });

      expect(result).toEqual(mockUserCategory);
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId }),
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      prisma.category.findFirst.mockResolvedValue(mockUserCategory);

      await expect(
        service.create(userId, {
          name: 'My Category',
          icon: '⭐',
          color: '#123456',
          type: 'Expense' as any,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a user category', async () => {
      const updated = { ...mockUserCategory, name: 'Updated' };
      prisma.category.findUnique.mockResolvedValue(mockUserCategory);
      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.update.mockResolvedValue(updated);

      const result = await service.update('cat-user-1', userId, {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });

    it('should throw ForbiddenException on global category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockGlobalCategory);

      await expect(
        service.update('cat-global-1', userId, { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException on other user category', async () => {
      prisma.category.findUnique.mockResolvedValue({
        ...mockUserCategory,
        userId: 'other-user',
      });

      await expect(
        service.update('cat-user-1', userId, { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a user category with no transactions', async () => {
      prisma.category.findUnique.mockResolvedValue(mockUserCategory);
      prisma.transaction.count.mockResolvedValue(0);
      prisma.category.delete.mockResolvedValue(mockUserCategory);

      await service.remove('cat-user-1', userId);

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-user-1' },
      });
    });

    it('should throw ConflictException when category has transactions', async () => {
      prisma.category.findUnique.mockResolvedValue(mockUserCategory);
      prisma.transaction.count.mockResolvedValue(5);

      await expect(service.remove('cat-user-1', userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException on global category', async () => {
      prisma.category.findUnique.mockResolvedValue(mockGlobalCategory);

      await expect(service.remove('cat-global-1', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

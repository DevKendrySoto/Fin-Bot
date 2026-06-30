import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, type?: string) {
    const where: Record<string, unknown> = {
      OR: [
        { userId: null },   // categorías globales
        { userId },         // categorías del usuario
      ],
    };
    if (type) where.type = type;

    return this.prisma.category.findMany({
      where,
      orderBy: [{ userId: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { name: dto.name, userId },
    });
    if (existing) throw new ConflictException('Category with this name already exists');

    return this.prisma.category.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (category.userId === null) {
      throw new ForbiddenException('Cannot modify default categories');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name) {
      const duplicate = await this.prisma.category.findFirst({
        where: { name: dto.name, userId, NOT: { id } },
      });
      if (duplicate) throw new ConflictException('Category name already in use');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id);

    if (category.userId === null) {
      throw new ForbiddenException('Cannot delete default categories');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const inUse = await this.prisma.transaction.count({ where: { categoryId: id } });
    if (inUse > 0) {
      throw new ConflictException('Cannot delete category that has associated transactions');
    }

    await this.prisma.category.delete({ where: { id } });
  }
}

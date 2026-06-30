import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSavingGoalDto } from '../dto/create-saving-goal.dto';
import { ContributeSavingGoalDto } from '../dto/contribute-saving-goal.dto';

@Injectable()
export class SavingGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { targetDate: 'asc' },
    });
    return goals.map((g) => this.enrichGoal(g));
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.savingGoal.findUnique({ where: { id } });

    if (!goal) throw new NotFoundException('Saving goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');

    return this.enrichGoal(goal);
  }

  async create(userId: string, dto: CreateSavingGoalDto) {
    const goal = await this.prisma.savingGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        currentAmount: 0,
        targetDate: new Date(dto.targetDate),
      },
    });
    return this.enrichGoal(goal);
  }

  async contribute(id: string, userId: string, dto: ContributeSavingGoalDto) {
    const goal = await this.prisma.savingGoal.findUnique({ where: { id } });

    if (!goal) throw new NotFoundException('Saving goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('Access denied');
    if (goal.currentAmount >= goal.targetAmount) {
      throw new BadRequestException('Goal already reached');
    }

    const updated = await this.prisma.savingGoal.update({
      where: { id },
      data: { currentAmount: { increment: dto.amount } },
    });

    return this.enrichGoal(updated);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.savingGoal.delete({ where: { id } });
  }

  private enrichGoal(goal: any) {
    const percentage =
      goal.targetAmount > 0
        ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
        : 0;

    const today = new Date();
    const target = new Date(goal.targetDate);
    const daysRemaining = Math.max(
      0,
      Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const achieved = goal.currentAmount >= goal.targetAmount;

    return { ...goal, percentageReached: percentage, daysRemaining, remaining, achieved };
  }
}

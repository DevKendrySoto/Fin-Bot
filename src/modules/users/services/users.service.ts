import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        name: true,
        currency: true,
        timezone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        telegramId: true,
        name: true,
        currency: true,
        timezone: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async deleteAccount(userId: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    // Cascade deletes handle related records via Prisma schema
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [transactionCount, reminderCount, goalCount] = await Promise.all([
      this.prisma.transaction.count({ where: { userId } }),
      this.prisma.paymentReminder.count({ where: { userId, active: true } }),
      this.prisma.savingGoal.count({ where: { userId } }),
    ]);

    return {
      transactionCount,
      activeReminders: reminderCount,
      savingGoals: goalCount,
    };
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { telegramId, name, currency, timezone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        telegramId,
        name,
        currency: currency || 'RD$',
        timezone: timezone || 'America/Santo_Domingo',
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { telegramId } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new BadRequestException('User not found. Please register first.');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId,
    });

    return {
      id: user.id,
      telegramId: user.telegramId,
      name: user.name,
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      return null;
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SavingGoalsService } from '../services/saving-goals.service';
import { CreateSavingGoalDto } from '../dto/create-saving-goal.dto';
import { ContributeSavingGoalDto } from '../dto/contribute-saving-goal.dto';

@UseGuards(JwtAuthGuard)
@Controller('saving-goals')
export class SavingGoalsController {
  constructor(private readonly savingGoalsService: SavingGoalsService) {}

  @Get()
  async findAll(@CurrentUser('userId') userId: string) {
    const data = await this.savingGoalsService.findAll(userId);
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.savingGoalsService.findOne(id, userId);
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSavingGoalDto,
  ) {
    const data = await this.savingGoalsService.create(userId, dto);
    return {
      data,
      message: 'Saving goal created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/contribute')
  async contribute(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: ContributeSavingGoalDto,
  ) {
    const data = await this.savingGoalsService.contribute(id, userId, dto);
    return {
      data,
      message: 'Contribution added successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.savingGoalsService.remove(id, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionQueryDto } from '../dto/transaction-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    const data = await this.transactionsService.create(userId, dto);
    return {
      data,
      message: 'Transaction created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll(
    @CurrentUser('userId') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    const result = await this.transactionsService.findAll(userId, query);
    return {
      ...result,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('balance')
  async getBalance(@CurrentUser('userId') userId: string) {
    const data = await this.transactionsService.getBalance(userId);
    return {
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('summary')
  async getSummary(
    @CurrentUser('userId') userId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    const now = new Date();
    const data = await this.transactionsService.getSummary(
      userId,
      month ?? now.getMonth() + 1,
      year ?? now.getFullYear(),
    );
    return {
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.transactionsService.findOne(id, userId);
    return {
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const data = await this.transactionsService.update(id, userId, dto);
    return {
      data,
      message: 'Transaction updated successfully',
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
    await this.transactionsService.remove(id, userId);
  }
}

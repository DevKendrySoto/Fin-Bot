import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaymentRemindersService } from '../services/payment-reminders.service';
import { CreatePaymentReminderDto } from '../dto/create-payment-reminder.dto';
import { UpdatePaymentReminderDto } from '../dto/update-payment-reminder.dto';

@UseGuards(JwtAuthGuard)
@Controller('payment-reminders')
export class PaymentRemindersController {
  constructor(private readonly service: PaymentRemindersService) {}

  @Get()
  async findAll(@CurrentUser('userId') userId: string) {
    const data = await this.service.findAll(userId);
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.service.findOne(id, userId);
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePaymentReminderDto,
  ) {
    const data = await this.service.create(userId, dto);
    return {
      data,
      message: 'Payment reminder created successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdatePaymentReminderDto,
  ) {
    const data = await this.service.update(id, userId, dto);
    return {
      data,
      message: 'Payment reminder updated successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/complete')
  async markCompleted(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.service.markCompleted(id, userId);
    return {
      data,
      message: 'Payment marked as completed',
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
    await this.service.remove(id, userId);
  }
}

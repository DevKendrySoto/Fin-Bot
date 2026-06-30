import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReportsService } from '../services/reports.service';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class WeeklyReportQueryDto {
  @IsInt() @Min(1) @Max(53) @IsOptional() @Type(() => Number)
  week?: number;

  @IsInt() @Min(2000) @IsOptional() @Type(() => Number)
  year?: number;
}

class MonthlyReportQueryDto {
  @IsInt() @Min(1) @Max(12) @IsOptional() @Type(() => Number)
  month?: number;

  @IsInt() @Min(2000) @IsOptional() @Type(() => Number)
  year?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weekly')
  async getWeekly(
    @CurrentUser('userId') userId: string,
    @Query() query: WeeklyReportQueryDto,
  ) {
    const data = await this.reportsService.getWeeklyReport(
      userId,
      query.week,
      query.year,
    );
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }

  @Get('monthly')
  async getMonthly(
    @CurrentUser('userId') userId: string,
    @Query() query: MonthlyReportQueryDto,
  ) {
    const data = await this.reportsService.getMonthlyReport(
      userId,
      query.month,
      query.year,
    );
    return { data, statusCode: HttpStatus.OK, timestamp: new Date().toISOString() };
  }
}

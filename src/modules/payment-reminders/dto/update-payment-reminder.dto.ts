import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ReminderFrequency } from './create-payment-reminder.dto';

export class UpdatePaymentReminderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  serviceName?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  amount?: number;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  paymentDay?: number;

  @IsEnum(ReminderFrequency)
  @IsOptional()
  frequency?: ReminderFrequency;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

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

export enum ReminderFrequency {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
}

export class CreatePaymentReminderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  serviceName!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  paymentDay!: number;

  @IsEnum(ReminderFrequency)
  frequency!: ReminderFrequency;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;
}

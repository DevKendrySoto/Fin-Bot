import {
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description!: string;

  @IsDateString()
  transactionDate!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

import { IsString, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { TransactionType } from 'src/modules/transactions/dto/create-transaction.dto';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  icon!: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color (e.g. #FF5733)' })
  color!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;
}

import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  categoryId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monthlyLimit!: number;
}

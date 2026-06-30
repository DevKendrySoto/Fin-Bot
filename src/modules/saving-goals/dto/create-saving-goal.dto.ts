import { IsString, IsNumber, IsPositive, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateSavingGoalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetAmount!: number;

  @IsDateString()
  targetDate!: string;
}

import { IsNumber, IsPositive } from 'class-validator';

export class ContributeSavingGoalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;
}

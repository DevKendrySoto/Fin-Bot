import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  @IsOptional()
  icon?: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color (e.g. #FF5733)' })
  @IsOptional()
  color?: string;
}

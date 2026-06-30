import { IsString, IsOptional, IsEnum } from 'class-validator';

enum CurrencyEnum {
  RD = 'RD$',
  USD = 'USD',
  EUR = 'EUR',
}

enum TimezoneEnum {
  SANTO_DOMINGO = 'America/Santo_Domingo',
  NEW_YORK = 'America/New_York',
  LONDON = 'Europe/London',
  MADRID = 'Europe/Madrid',
}

export class RegisterDto {
  @IsString()
  telegramId!: string;

  @IsString()
  name!: string;

  @IsEnum(CurrencyEnum)
  @IsOptional()
  currency?: string;

  @IsEnum(TimezoneEnum)
  @IsOptional()
  timezone?: string;
}

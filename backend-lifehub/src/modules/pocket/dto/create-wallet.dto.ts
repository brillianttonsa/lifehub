import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export type WalletType = 'CASH' | 'BANK' | 'MOBILE_MONEY';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['CASH', 'BANK', 'MOBILE_MONEY'])
  type: WalletType;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  balance?: string;
}

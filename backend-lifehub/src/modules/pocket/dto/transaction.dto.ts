import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export class CreateTransactionDto {
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsUUID()
  sourceWalletId?: string;

  @IsOptional()
  @IsUUID()
  destinationWalletId?: string;

  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type?: TransactionType;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsUUID()
  sourceWalletId?: string;

  @IsOptional()
  @IsUUID()
  destinationWalletId?: string;

  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

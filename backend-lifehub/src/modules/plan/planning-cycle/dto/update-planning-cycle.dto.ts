import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { CycleType, CycleStatus } from '../planning-cycle.service';

const CYCLE_TYPES: CycleType[] = ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom'];
const CYCLE_STATUSES: CycleStatus[] = ['Active', 'Completed', 'Archived'];

export class UpdatePlanningCycleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(CYCLE_TYPES)
  type?: CycleType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(CYCLE_STATUSES)
  status?: CycleStatus;
}

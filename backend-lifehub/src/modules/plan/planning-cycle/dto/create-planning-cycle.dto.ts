import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { CycleType, CycleStatus } from '../planning-cycle.service';

const CYCLE_TYPES: CycleType[] = ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom'];
const CYCLE_STATUSES: CycleStatus[] = ['Active', 'Completed', 'Archived'];

export class CreatePlanningCycleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsIn(CYCLE_TYPES)
  type: CycleType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsIn(CYCLE_STATUSES)
  @IsOptional()
  status?: CycleStatus;
}

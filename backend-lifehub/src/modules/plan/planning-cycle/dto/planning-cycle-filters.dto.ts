import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import type { CycleType, CycleStatus } from '../planning-cycle.service';

const CYCLE_TYPES: CycleType[] = ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom'];
const CYCLE_STATUSES: CycleStatus[] = ['Active', 'Completed', 'Archived'];

export class PlanningCycleFiltersDto {
  @IsOptional()
  @IsIn(CYCLE_STATUSES)
  status?: CycleStatus;

  @IsOptional()
  @IsIn(CYCLE_TYPES)
  type?: CycleType;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

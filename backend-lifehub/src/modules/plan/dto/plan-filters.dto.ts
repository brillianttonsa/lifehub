import { IsInt, IsOptional, IsEnum, IsString, Min, Max, IsIn } from 'class-validator';
import { Transform  } from 'class-transformer';
import type { TimeframeType, PriorityType, StatusType  } from '../plan.service';

const TIMEFRAMES: TimeframeType[] = ["Yearly", "Half-Yearly", "Quarterly", "Monthly", "Weekly", "Custom Range"];
const PRIORITIES: PriorityType[] = ["Low", "Medium", "High"];
const STATUSES: StatusType[] = ["Draft", "Active", "Completed", "Archived", "Cancelled"];

export class PlanFiltersDto {
    @IsIn(STATUSES)
    @IsOptional()
    status?: StatusType;

    @IsOptional()
    @IsIn(TIMEFRAMES)
    timeframe: TimeframeType;

    @IsIn(PRIORITIES)
    @IsOptional()
    priority?: PriorityType;

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

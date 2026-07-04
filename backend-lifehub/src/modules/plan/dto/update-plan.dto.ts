import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import type { TimeframeType, PriorityType, StatusType  } from '../plan.service';

const TIMEFRAMES: TimeframeType[] = ["Yearly", "Half-Yearly", "Quarterly", "Monthly", "Weekly", "Custom Range"];
const PRIORITIES: PriorityType[] = ["Low", "Medium", "High"];
const STATUSES: StatusType[] = ["Draft", "Active", "Completed", "Archived", "Cancelled"];

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

   @IsOptional()
      @IsIn(TIMEFRAMES)
      timeframe: TimeframeType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

 
  
      @IsIn(PRIORITIES)
      @IsOptional()
      priority?: PriorityType;

  @IsIn(STATUSES)
      @IsOptional()
      status?: StatusType;

  @IsOptional()
  progress?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

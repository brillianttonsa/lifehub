import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import type { GoalPriority, GoalStatus } from '../goal.service';

const PRIORITIES: GoalPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: GoalStatus[] = ['Pending', 'In Progress', 'Completed'];

export class GoalFiltersDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: GoalStatus;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: GoalPriority;

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

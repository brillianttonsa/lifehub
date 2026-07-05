import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { GoalPriority, GoalStatus } from '../goal.service';

const PRIORITIES: GoalPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: GoalStatus[] = ['Pending', 'In Progress', 'Completed'];

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: GoalPriority;

  @IsOptional()
  @IsIn(STATUSES)
  status?: GoalStatus;

  @IsOptional()
  progress?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

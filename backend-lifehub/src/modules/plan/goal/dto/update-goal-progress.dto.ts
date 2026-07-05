import { IsInt, Min, Max } from 'class-validator';

export class UpdateGoalProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;
}

import { IsIn } from 'class-validator';

const STATUSES = ['active', 'completed', 'archived'] as const;

export class UpdateCycleStatusDto {
  @IsIn(STATUSES)
  status: (typeof STATUSES)[number];
}

import { IsDateString, IsUUID } from 'class-validator';

export class ToggleLogDto {
  @IsUUID()
  task_id: string;

  @IsDateString()
  date: string;
}

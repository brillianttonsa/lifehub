import { IsBoolean, IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @IsDateString()
  entryDate: string;

  @IsBoolean()
  commentsEnabled: boolean;
}

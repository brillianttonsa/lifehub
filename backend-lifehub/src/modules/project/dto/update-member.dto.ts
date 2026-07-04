import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberDto {
  @IsEnum(['contributor', 'viewer_comment', 'viewer'])
  @IsNotEmpty()
  role: 'contributor' | 'viewer_comment' | 'viewer';
}

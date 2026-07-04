import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(['contributor', 'viewer_comment', 'viewer'])
  role: 'contributor' | 'viewer_comment' | 'viewer';
}

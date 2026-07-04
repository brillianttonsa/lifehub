import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get(':projectId/members')
  async list(@Param('projectId') projectId: string) {
    return this.memberService.listMembers(projectId);
  }

  @Post(':projectId/members')
  async add(
    @Param('projectId') projectId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.memberService.addMember(projectId, dto.email, dto.role);
  }

  @Patch(':projectId/members/:userId')
  async update(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.memberService.updateMember(projectId, userId, dto.role);
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(204)
  async remove(@Param('projectId') projectId: string, @Param('userId') userId: string) {
    await this.memberService.removeMember(projectId, userId);
  }
}

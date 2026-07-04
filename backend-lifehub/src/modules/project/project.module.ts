import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MemberController } from './member.controller';
import { EntryController } from './entry.controller';
import { CommentController } from './comment.controller';
import { MemberService } from './member.service';
import { EntryService } from './entry.service';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  controllers: [ProjectController, MemberController, EntryController, CommentController],
  providers: [
    ProjectService,
    MemberService,
    EntryService,
    CommentService,
    JwtAuthGuard,
  ],
})
export class ProjectModule {}

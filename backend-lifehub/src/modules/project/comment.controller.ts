import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('project/entries')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':entryId/comments')
  async list(@CurrentUserId() userId: string, @Param('entryId') entryId: string) {
    return this.commentService.listComments(entryId, userId);
  }

  @Post(':entryId/comments')
  async create(
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Body('content') content: string,
  ) {
    return this.commentService.createComment(entryId, userId, content);
  }

  @Delete(':entryId/comments/:commentId')
  @HttpCode(204)
  async remove(
    @CurrentUserId() userId: string,
    @Param('entryId') entryId: string,
    @Param('commentId') commentId: string,
  ) {
    await this.commentService.deleteComment(entryId, commentId, userId);
  }
}

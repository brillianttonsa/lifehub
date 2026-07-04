import { Body, Controller, Delete, Get, HttpCode, Param, Post, Patch, Query, UseGuards } from '@nestjs/common';
import { EntryService } from './entry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @Get(':projectId/entries')
  async list(@Param('projectId') projectId: string, @Query('cursor') cursor?: string) {
    const { page, hasMore, countMap } = await this.entryService.listEntries(projectId, cursor);

    return {
      entries: page.map((r) => ({
        id: r.id,
        projectId: r.projectId,
        authorId: r.authorId,
        authorName: r.authorName,
        content: r.content,
        entryDate: r.entryDate,
        commentsEnabled: r.commentsEnabled,
        commentCount: countMap.get(r.id) ?? 0,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      nextCursor: hasMore ? page[page.length - 1].createdAt.toISOString() : null,
    };
  }

  @Post(':projectId/entries')
  async create(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateEntryDto,
  ) {
    const { row, authorName } = await this.entryService.createEntry(projectId, userId, {
      content: dto.content,
      entryDate: dto.entryDate,
      commentsEnabled: dto.commentsEnabled,
    });

    return {
      id: row.id,
      projectId: row.projectId,
      authorId: row.authorId,
      authorName,
      content: row.content,
      entryDate: row.entryDate,
      commentsEnabled: row.commentsEnabled,
      commentCount: 0,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  @Patch(':projectId/entries/:entryId')
  async update(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateEntryDto,
  ) {
    const row = await this.entryService.updateEntry(projectId, entryId, userId, {
      content: dto.content,
      entryDate: dto.entryDate,
      commentsEnabled: dto.commentsEnabled,
    });

    return {
      id: row.id,
      projectId: row.projectId,
      authorId: row.authorId,
      content: row.content,
      entryDate: row.entryDate,
      commentsEnabled: row.commentsEnabled,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  @Delete(':projectId/entries/:entryId')
  @HttpCode(204)
  async remove(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Param('entryId') entryId: string,
  ) {
    await this.entryService.deleteEntry(projectId, entryId, userId);
  }
}

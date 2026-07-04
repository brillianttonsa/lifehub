import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards, HttpCode, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateActivityDto } from './dto/activity.dto';

@UseGuards(JwtAuthGuard)
@Controller('pocket/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreateActivityDto) {
    return this.activityService.create(userId, dto.name);
  }

  @Get()
  async getUserActivities(
    @CurrentUserId() userId: string,
    @Query('status') status?: string,
  ) {
    return this.activityService.getUserActivities(userId, status);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.activityService.delete(userId, id);
  }

  @Patch(':id/restore')
  async restore(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.activityService.restore(userId, id);
  }
}

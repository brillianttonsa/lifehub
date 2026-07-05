import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto';
import { GoalFiltersDto } from './dto/goal-filters.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get('planning-cycles/:cycleId/goals')
  async listByCycle(
    @CurrentUserId() userId: string,
    @Param('cycleId') cycleId: string,
    @Query() filters: GoalFiltersDto,
  ) {
    return this.goalService.listByCycle(userId, cycleId, filters);
  }

  @Post('planning-cycles/:cycleId/goals')
  async create(
    @CurrentUserId() userId: string,
    @Param('cycleId') cycleId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalService.create(userId, cycleId, dto);
  }

  @Get('goals/:id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.goalService.get(userId, id);
  }

  @Patch('goals/:id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalService.update(userId, id, dto);
  }

  @Delete('goals/:id')
  @HttpCode(204)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.goalService.delete(userId, id);
  }

  @Patch('goals/:id/progress')
  async updateProgress(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ) {
    return this.goalService.updateProgress(userId, id, dto.progress);
  }
}

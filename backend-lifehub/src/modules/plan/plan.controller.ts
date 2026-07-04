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
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PlanFiltersDto } from './dto/plan-filters.dto';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get('dashboard')
  async dashboard(@CurrentUserId() userId: string) {
    return this.planService.dashboard(userId);
  }

  @Get('search')
  async search(
    @CurrentUserId() userId: string,
    @Query() filters: PlanFiltersDto,
  ) {
    return this.planService.search(userId, filters);
  }

  @Get()
  async list(
    @CurrentUserId() userId: string,
    @Query() filters: PlanFiltersDto,
  ) {
    return this.planService.list(userId, filters);
  }

  @Get(':id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.planService.get(userId, id);
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreatePlanDto) {
    return this.planService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.planService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.planService.delete(userId, id);
  }

  @Patch(':id/archive')
  async archive(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.planService.archive(userId, id);
  }

  @Patch(':id/progress')
  async updateProgress(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.planService.updateProgress(userId, id, dto);
  }
}

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
import { PlanningCycleService } from './planning-cycle.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { CreatePlanningCycleDto } from './dto/create-planning-cycle.dto';
import { UpdatePlanningCycleDto } from './dto/update-planning-cycle.dto';
import { PlanningCycleFiltersDto } from './dto/planning-cycle-filters.dto';

@UseGuards(JwtAuthGuard)
@Controller('planning-cycles')
export class PlanningCycleController {
  constructor(private readonly planningCycleService: PlanningCycleService) {}

  @Get('dashboard')
  async dashboard(@CurrentUserId() userId: string) {
    return this.planningCycleService.dashboard(userId);
  }

  @Get('search')
  async search(@CurrentUserId() userId: string, @Query() filters: PlanningCycleFiltersDto) {
    return this.planningCycleService.search(userId, filters);
  }

  @Get()
  async list(@CurrentUserId() userId: string, @Query() filters: PlanningCycleFiltersDto) {
    return this.planningCycleService.list(userId, filters);
  }

  @Get(':id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.planningCycleService.get(userId, id);
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreatePlanningCycleDto) {
    return this.planningCycleService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePlanningCycleDto,
  ) {
    return this.planningCycleService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.planningCycleService.delete(userId, id);
  }

  @Patch(':id/archive')
  async archive(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.planningCycleService.archive(userId, id);
  }
}

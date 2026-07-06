import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DisciplineService } from './discipline.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleStatusDto } from './dto/update-cycle-status.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ToggleLogDto } from './dto/toggle-log.dto';

@UseGuards(JwtAuthGuard)
@Controller('discipline')
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  // -- Cycles -------------------------------------------------------------

  @Post('cycles')
  async createCycle(@CurrentUserId() userId: string, @Body() dto: CreateCycleDto) {
    return this.disciplineService.createCycle(userId, dto);
  }

  @Get('cycles')
  async listCycles(@CurrentUserId() userId: string) {
    return this.disciplineService.listCycles(userId);
  }

  @Get('cycles/:id')
  async getCycle(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.disciplineService.getCycle(userId, id);
  }

  @Patch('cycles/:id/status')
  async updateCycleStatus(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCycleStatusDto,
  ) {
    return this.disciplineService.updateCycleStatus(userId, id, dto.status);
  }

  @Delete('cycles/:id')
  @HttpCode(204)
  async deleteCycle(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.disciplineService.deleteCycle(userId, id);
  }

  // -- Tasks ----------------------------------------------------------------

  @Post('cycles/:id/tasks')
  async createTask(
    @CurrentUserId() userId: string,
    @Param('id') cycleId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.disciplineService.createTask(userId, cycleId, dto.title);
  }

  @Get('cycles/:id/tasks')
  async listTasks(@CurrentUserId() userId: string, @Param('id') cycleId: string) {
    return this.disciplineService.listTasks(userId, cycleId);
  }

  @Patch('tasks/:id')
  async updateTask(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.disciplineService.updateTask(userId, id, dto.title);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  async deleteTask(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.disciplineService.deleteTask(userId, id);
  }

  // -- Grid + toggle ----------------------------------------------------------

  @Get('cycles/:id/grid')
  async getGrid(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.disciplineService.getGrid(userId, id);
  }

  @Post('toggle')
  async toggle(@CurrentUserId() userId: string, @Body() dto: ToggleLogDto) {
    return this.disciplineService.toggleCell(userId, dto.task_id, dto.date);
  }
}

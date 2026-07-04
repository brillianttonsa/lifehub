import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async list(@CurrentUserId() userId: string) {
    return this.projectService.list(userId);
  }

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreateProjectDto) {
    return this.projectService.create(userId, dto.name, dto.description);
  }

  @Get(':id')
  async get(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.projectService.get(userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(userId, id, {
      name: dto.name,
      description: dto.description,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    await this.projectService.delete(userId, id);
  }
}

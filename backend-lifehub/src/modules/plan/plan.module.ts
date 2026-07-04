import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  controllers: [PlanController],
  providers: [PlanService, JwtAuthGuard],
})
export class PlanModule {}

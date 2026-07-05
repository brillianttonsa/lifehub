import { Module } from '@nestjs/common';
import { PlanningCycleController } from './planning-cycle/planning-cycle.controller';
import { PlanningCycleService } from './planning-cycle/planning-cycle.service';
import { GoalController } from './goal/goal.controller';
import { GoalService } from './goal/goal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  controllers: [PlanningCycleController, GoalController],
  providers: [PlanningCycleService, GoalService, JwtAuthGuard],
  exports: [PlanningCycleService, GoalService],
})
export class PlanModule {}

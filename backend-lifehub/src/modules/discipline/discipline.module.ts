import { Module } from '@nestjs/common';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  controllers: [DisciplineController],
  providers: [DisciplineService, JwtAuthGuard],
  exports: [DisciplineService],
})
export class DisciplineModule {}

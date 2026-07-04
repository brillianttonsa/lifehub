import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { PlanModule } from './modules/plan/plan.module';
import { PocketModule } from './modules/pocket/pocket.module';

@Module({
  imports: [AuthModule, ProjectModule, PlanModule, PocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

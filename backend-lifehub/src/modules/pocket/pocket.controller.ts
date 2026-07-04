import { Controller, Get, UseGuards } from '@nestjs/common';
import { PocketService } from './pocket.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pocket')
export class PocketController {
  constructor(private readonly pocketService: PocketService) {}

  @Get('overview')
  async overview(@CurrentUserId() userId: string) {
    return {
      success: true,
      data: await this.pocketService.overview(userId),
    };
  }
}

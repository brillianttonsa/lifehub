import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, HttpCode } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@UseGuards(JwtAuthGuard)
@Controller('pocket/wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(@CurrentUserId() userId: string, @Body() dto: CreateWalletDto) {
    return this.walletService.create(userId, dto);
  }

  @Get()
  async getUserWallets(@CurrentUserId() userId: string) {
    return this.walletService.getUserWallets(userId);
  }

  @Get(':id')
  async getById(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.walletService.getById(userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.walletService.delete(userId, id);
  }
}

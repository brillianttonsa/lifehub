import { Module } from '@nestjs/common';
import { PocketController } from './pocket.controller';
import { PocketService } from './pocket.service';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  controllers: [PocketController, WalletController, TransactionController, ActivityController],
  providers: [PocketService, WalletService, TransactionService, ActivityService, JwtAuthGuard],
})
export class PocketModule {}

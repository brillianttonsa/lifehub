import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, HttpCode } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/user-id.decorator';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('pocket/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, dto);
  }

  @Get()
  async getUserTransactions(@CurrentUserId() userId: string) {
    return this.transactionService.getUserTransactions(userId);
  }

  @Patch(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.transactionService.delete(userId, id);
  }
}

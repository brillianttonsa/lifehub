import { db } from '../../../db';
import { wallets } from '../../../db/schema/pocket/wallets';
import { transactions } from '../../../db/schema/pocket/transactions';
import { eq } from 'drizzle-orm';

export class PocketService {
  async overview(userId: string) {
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const totalBalance = userWallets.reduce(
      (sum, w) => sum + Number(w.balance),
      0,
    );

    const income = userTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = userTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const byType = {
      CASH: 0,
      BANK: 0,
      MOBILE_MONEY: 0,
    };

    for (const w of userWallets) {
      byType[w.type] += Number(w.balance);
    }

    return {
      totalBalance,
      income,
      expense,
      walletCount: userWallets.length,
      byType,
    };
  }
}

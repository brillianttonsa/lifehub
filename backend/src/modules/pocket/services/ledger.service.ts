import { AppError } from "../../../shared/errors";
import { ledgerRepo } from "../repositories/ledger.repository";

export const ledgerService = {
  async apply(client: any, input: {
    transactionId: string;
    userId: string; 
    kind: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number;
    sourceWalletId?: string;
    destinationWalletId?: string;
  }) {
    const executeMovement = async (walletId: string, entryType: "DEBIT" | "CREDIT") => {
      const { rows } = await client.query(
        `
        SELECT
          w."id" as "id",
          w."user_id" as "userId",
          w."name" as "name",
          w."balance" as "balance"
        FROM "Wallet" w
        WHERE w."id" = $1
          AND w."deleted_at" IS NULL
        FOR UPDATE
        `,
        [walletId],
      );

      const wallet = rows[0];
      if (!wallet || wallet.userId !== input.userId) throw new AppError("Wallet not found");

      const before = Number(wallet.balance);
      const after = entryType === "CREDIT" ? before + input.amount : before - input.amount;
      if (after < 0) throw new AppError(`Insufficient funds in ${wallet.name}`);

      const updated = await client.query(
        `
        UPDATE "Wallet"
        SET
          "balance" = $2,
          "updated_at" = NOW()
        WHERE "id" = $1
        RETURNING "balance" as "balance"
        `,
        [walletId, after],
      );

      await ledgerRepo.create(client, {
        userId: input.userId,
        walletId,
        transactionId: input.transactionId,
        entryType,
        amount: input.amount,
        balanceBefore: before,
        balanceAfter: Number(updated.rows[0].balance),
      });
    };

    // Logic Routing
    if (input.kind === "INCOME" && input.destinationWalletId)
      await executeMovement(input.destinationWalletId, "CREDIT");

    if (input.kind === "EXPENSE" && input.sourceWalletId)
      await executeMovement(input.sourceWalletId, "DEBIT");

    if (input.kind === "TRANSFER") {
      await executeMovement(input.sourceWalletId!, "DEBIT");
      await executeMovement(input.destinationWalletId!, "CREDIT");
    }
  },

  async reverse(client: any, transactionId: string, userId: string) {
    // Find every ledger entry created by this transaction
    const entries = await ledgerRepo.findByTransaction(client, transactionId, userId);

    for (const entry of entries) {
      const { rows } = await client.query(
        `
        SELECT
          w."id" as "id",
          w."user_id" as "userId",
          w."balance" as "balance"
        FROM "Wallet" w
        WHERE w."id" = $1
          AND w."deleted_at" IS NULL
        FOR UPDATE
        `,
        [entry.walletId],
      );

      const wallet = rows[0];
      if (!wallet || wallet.userId !== userId) throw new AppError("Wallet not found");

      const before = Number(wallet.balance);
      const after = entry.entryType === "CREDIT" ? before - entry.amount : before + entry.amount;

      await client.query(
        `
        UPDATE "Wallet"
        SET
          "balance" = $2,
          "updated_at" = NOW()
        WHERE "id" = $1
        `,
        [entry.walletId, after],
      );
    }

    // Wipe the old ledger records before the service re-applies new ones
    await ledgerRepo.deleteByTransaction(client, transactionId, userId);
  },
};
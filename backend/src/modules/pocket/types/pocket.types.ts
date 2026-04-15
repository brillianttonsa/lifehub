export type TransactionKind = "INCOME" | "EXPENSE" | "TRANSFER";

export type TransactionInput = {
  userId: string; // The owner of the transaction
  kind: TransactionKind;
  amount: number;
  occurredAt: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  categoryId?: string;
  description?: string;
};

export type WalletType = "CASH" | "BANK" | "MOBILE_MONEY";

export type WalletInput = {
  name: string;
  type: WalletType;
  provider?: string;
  userId: string;
  balance?: number;
};
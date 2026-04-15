export type WalletKind = 'CASH' | 'BANK' | 'MOBILE_MONEY';
export type TransactionKind = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Wallet {
  id: string;
  name: string;
  type: WalletKind;
  provider?: string;
  balance: number; // We keep it as number for calculations
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amount: number;
  occurredAt: string;
  description?: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  sourceWallet?: Wallet;
  destinationWallet?: Wallet;
}

export interface WalletFormValues {
  name: string;
  type: WalletKind;
  provider: string;
  balance: string; // String for input handling
}

export interface TransactionFormValues {
  kind: TransactionKind;
  amount: string;
  occurredAt: string;
  sourceWalletId: string;
  destinationWalletId: string;
  description: string;
}
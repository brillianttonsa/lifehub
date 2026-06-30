type WalletType = 'CASH' | 'BANK' | 'MOBILE_MONEY';

export type CreateWalletDTO = {
  name: string;
  type: WalletType;
  provider?: string;
  balance?: string;
};

export type UpdateWalletDTO = {
  name?: string;
  provider?: string;
};

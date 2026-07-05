export type WalletType = 'CASH' | 'BANK' | 'MOBILE_MONEY'
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type ActivityStatus = 'active' | 'deleted'

export interface Wallet {
  id: string
  userId: string
  name: string
  type: WalletType
  provider: string | null
  balance: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PocketActivity {
  id: string
  userId: string
  name: string
  isDefault: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PocketTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: string
  sourceWalletId: string | null
  destinationWalletId: string | null
  activityId: string | null
  description: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export interface PocketOverview {
  totalBalance: number
  income: number
  expense: number
  walletCount: number
  byType: Record<WalletType, number>
}

export interface CreateWalletInput {
  name: string
  type: WalletType
  provider?: string
  balance?: string
}

export interface CreateActivityInput {
  name: string
}

export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  sourceWalletId?: string
  destinationWalletId?: string
  activityId?: string
  description?: string
  occurredAt: string
}

export interface User {
  id: string
  email: string
  fullName: string
}

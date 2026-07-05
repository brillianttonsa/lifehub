import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Banknote, CreditCard, Landmark } from 'lucide-react'
import { TransactionType, WalletType } from '../../types/pocket'

export const walletTypeLabels: Record<WalletType, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  MOBILE_MONEY: 'Mobile Money',
}

export const transactionLabels: Record<TransactionType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
}

export function formatMoney(value: string | number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'TSH',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function getWalletIcon(type: WalletType) {
  if (type === 'CASH') return Banknote
  if (type === 'BANK') return Landmark
  return CreditCard
}

export function getTransactionIcon(type: TransactionType) {
  if (type === 'INCOME') return ArrowDownLeft
  if (type === 'EXPENSE') return ArrowUpRight
  return ArrowRightLeft
}
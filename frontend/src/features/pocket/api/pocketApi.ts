import { apiClient } from '../../../lib/apiClient'
import {
  ActivityStatus,
  CreateActivityInput,
  CreateTransactionInput,
  CreateWalletInput,
  PocketActivity,
  PocketOverview,
  PocketTransaction,
  Wallet,
} from '../../../types/pocket'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data
  }

  return payload as T
}

export async function getPocketOverview(): Promise<PocketOverview> {
  const response = await apiClient.get<ApiEnvelope<PocketOverview>>('/pocket/overview')
  return unwrap(response.data)
}

export async function listWallets(): Promise<Wallet[]> {
  const response = await apiClient.get<ApiEnvelope<Wallet[]>>('/pocket/wallets')
  return unwrap(response.data)
}

export async function createWallet(data: CreateWalletInput): Promise<Wallet> {
  const response = await apiClient.post<ApiEnvelope<Wallet>>('/pocket/wallets', data)
  return unwrap(response.data)
}

export async function updateWallet(
  walletId: string,
  data: Pick<CreateWalletInput, 'name' | 'provider'>,
): Promise<Wallet> {
  const response = await apiClient.patch<ApiEnvelope<Wallet>>(`/pocket/wallets/${walletId}`, data)
  return unwrap(response.data)
}

export async function deleteWallet(walletId: string): Promise<void> {
  await apiClient.delete(`/pocket/wallets/${walletId}`)
}

export async function listActivities(status: ActivityStatus = 'active'): Promise<PocketActivity[]> {
  const response = await apiClient.get<ApiEnvelope<PocketActivity[]>>('/pocket/activities', {
    params: { status },
  })
  return unwrap(response.data)
}

export async function createActivity(data: CreateActivityInput): Promise<PocketActivity> {
  const response = await apiClient.post<ApiEnvelope<PocketActivity>>('/pocket/activities', data)
  return unwrap(response.data)
}

export async function deleteActivity(activityId: string): Promise<void> {
  await apiClient.delete(`/pocket/activities/${activityId}`)
}

export async function restoreActivity(activityId: string): Promise<void> {
  await apiClient.patch(`/pocket/activities/${activityId}/restore`)
}

export async function listTransactions(): Promise<PocketTransaction[]> {
  const response = await apiClient.get<ApiEnvelope<PocketTransaction[]>>('/pocket/transactions')
  return unwrap(response.data)
}

export async function createTransaction(data: CreateTransactionInput): Promise<PocketTransaction> {
  const response = await apiClient.post<ApiEnvelope<PocketTransaction>>('/pocket/transactions', data)
  return unwrap(response.data)
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await apiClient.delete(`/pocket/transactions/${transactionId}`)
}

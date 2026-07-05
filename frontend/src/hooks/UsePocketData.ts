import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '../lib/apiClient'
import {
  createActivity,
  createTransaction,
  createWallet,
  deleteActivity,
  deleteTransaction,
  deleteWallet,
  getPocketOverview,
  listActivities,
  listTransactions,
  listWallets,
  restoreActivity,
} from '../api/pocketApi'
import {
  ActivityStatus,
  PocketActivity,
  PocketOverview,
  PocketTransaction,
  TransactionType,
  Wallet,
  WalletType,
} from '../types/pocket'
import { Toast } from '../types/project'

const emptyOverview: PocketOverview = {
  totalBalance: 0,
  income: 0,
  expense: 0,
  walletCount: 0,
  byType: { CASH: 0, BANK: 0, MOBILE_MONEY: 0 },
}

interface NewWalletPayload {
  name: string
  type: WalletType
  provider?: string
  balance: string
}

interface NewTransactionPayload {
  type: TransactionType
  amount: number
  sourceWalletId?: string
  destinationWalletId?: string
  activityId?: string
  description?: string
}

export function usePocketData() {
  const [overview, setOverview] = useState<PocketOverview>(emptyOverview)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [activities, setActivities] = useState<PocketActivity[]>([])
  // Independent of the active/deleted tab shown in the Activities panel, so the
  // transaction form's activity picker always has options to choose from.
  const [activeActivities, setActiveActivities] = useState<PocketActivity[]>([])
  const [transactions, setTransactions] = useState<PocketTransaction[]>([])
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('active')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const hasLoadedOnce = useRef(false)

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const refreshOverview = useCallback(async () => {
    try {
      setOverview(await getPocketOverview())
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [showToast])

  const refreshWallets = useCallback(async () => {
    try {
      setWallets(await listWallets())
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [showToast])

  const refreshActivities = useCallback(
    async (status: ActivityStatus) => {
      try {
        setActivities(await listActivities(status))
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [showToast],
  )

  const refreshActiveActivities = useCallback(async () => {
    try {
      setActiveActivities(await listActivities('active'))
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [showToast])

  const refreshTransactions = useCallback(async () => {
    try {
      setTransactions(await listTransactions())
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [showToast])

  // Full load only runs once, on mount. Every later mutation below refreshes just
  // the slice(s) of state it actually touched, so the rest of the page never
  // re-shows loading skeletons or flickers on a create/delete/restore.
  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [nextOverview, nextWallets, nextActivities, nextActiveActivities, nextTransactions] = await Promise.all([
        getPocketOverview(),
        listWallets(),
        listActivities(activityStatus),
        listActivities('active'),
        listTransactions(),
      ])
      setOverview(nextOverview)
      setWallets(nextWallets)
      setActivities(nextActivities)
      setActiveActivities(nextActiveActivities)
      setTransactions(nextTransactions)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsLoading(false)
      hasLoadedOnce.current = true
    }
  }, [activityStatus, showToast])

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switching the active/deleted tab only re-fetches the activities list,
  // not the whole page.
  useEffect(() => {
    if (hasLoadedOnce.current) {
      refreshActivities(activityStatus)
    }
  }, [activityStatus, refreshActivities])

  const createWalletEntry = useCallback(
    async (payload: NewWalletPayload) => {
      setIsSaving(true)
      try {
        await createWallet({
          name: payload.name,
          type: payload.type,
          provider: payload.provider || undefined,
          balance: payload.balance || '0',
        })
        await Promise.all([refreshWallets(), refreshOverview()])
        showToast('Wallet created.')
        return true
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [refreshWallets, refreshOverview, showToast],
  )

  const removeWallet = useCallback(
    async (walletId: string) => {
      try {
        await deleteWallet(walletId)
        await Promise.all([refreshWallets(), refreshOverview()])
        showToast('Wallet deleted.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [refreshWallets, refreshOverview, showToast],
  )

  const createActivityEntry = useCallback(
    async (name: string) => {
      setIsSaving(true)
      try {
        await createActivity({ name })
        await Promise.all([refreshActivities(activityStatus), refreshActiveActivities()])
        showToast('Activity created.')
        return true
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [activityStatus, refreshActivities, refreshActiveActivities, showToast],
  )

  const archiveActivity = useCallback(
    async (activityId: string) => {
      try {
        await deleteActivity(activityId)
        await Promise.all([refreshActivities(activityStatus), refreshActiveActivities()])
        showToast('Activity archived.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [activityStatus, refreshActivities, refreshActiveActivities, showToast],
  )

  const restoreActivityEntry = useCallback(
    async (activityId: string) => {
      try {
        await restoreActivity(activityId)
        await Promise.all([refreshActivities(activityStatus), refreshActiveActivities()])
        showToast('Activity restored.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [activityStatus, refreshActivities, refreshActiveActivities, showToast],
  )

  const createTransactionEntry = useCallback(
    async (payload: NewTransactionPayload) => {
      setIsSaving(true)
      try {
        await createTransaction({
          type: payload.type,
          amount: payload.amount,
          sourceWalletId: payload.sourceWalletId,
          destinationWalletId: payload.destinationWalletId,
          activityId: payload.activityId,
          description: payload.description,
          occurredAt: new Date().toISOString(),
        })
        await Promise.all([refreshTransactions(), refreshWallets(), refreshOverview()])
        showToast('Transaction recorded.')
        return true
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [refreshTransactions, refreshWallets, refreshOverview, showToast],
  )

  const removeTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await deleteTransaction(transactionId)
        await Promise.all([refreshTransactions(), refreshWallets(), refreshOverview()])
        showToast('Transaction removed.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [refreshTransactions, refreshWallets, refreshOverview, showToast],
  )

  return {
    overview,
    wallets,
    activities,
    activeActivities,
    transactions,
    activityStatus,
    setActivityStatus,
    isLoading,
    isSaving,
    toasts,
    removeToast,
    reloadAll: loadAll,
    createWalletEntry,
    removeWallet,
    createActivityEntry,
    archiveActivity,
    restoreActivityEntry,
    createTransactionEntry,
    removeTransaction,
  }
}
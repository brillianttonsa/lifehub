import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getApiErrorMessage } from '../../../lib/apiClient'
import { ToastContainer } from '../../projects/components/Toast'
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
} from '../../../types/pocket'
import { Toast, User } from '../../../types/project'

interface PocketModuleProps {
  currentUser: User
}

const walletTypeLabels: Record<WalletType, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  MOBILE_MONEY: 'Mobile Money',
}

const transactionLabels: Record<TransactionType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
}

const emptyOverview: PocketOverview = {
  totalBalance: 0,
  income: 0,
  expense: 0,
  walletCount: 0,
  byType: { CASH: 0, BANK: 0, MOBILE_MONEY: 0 },
}

function formatMoney(value: string | number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getWalletIcon(type: WalletType) {
  if (type === 'CASH') return Banknote
  if (type === 'BANK') return Landmark
  return CreditCard
}

function getTransactionIcon(type: TransactionType) {
  if (type === 'INCOME') return ArrowDownLeft
  if (type === 'EXPENSE') return ArrowUpRight
  return ArrowRightLeft
}

export function PocketModule({ currentUser }: PocketModuleProps) {
  const [overview, setOverview] = useState<PocketOverview>(emptyOverview)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [activities, setActivities] = useState<PocketActivity[]>([])
  const [transactions, setTransactions] = useState<PocketTransaction[]>([])
  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('active')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [walletForm, setWalletForm] = useState({
    name: '',
    type: 'CASH' as WalletType,
    provider: '',
    balance: '',
  })
  const [activityName, setActivityName] = useState('')
  const [transactionForm, setTransactionForm] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    sourceWalletId: '',
    destinationWalletId: '',
    activityId: '',
    description: '',
  })

  const activeWallets = useMemo(() => wallets.filter((wallet) => !wallet.isDeleted), [wallets])

  const walletNameById = useMemo(() => {
    return new Map(wallets.map((wallet) => [wallet.id, wallet.name]))
  }, [wallets])

  const activityNameById = useMemo(() => {
    return new Map(activities.map((activity) => [activity.id, activity.name]))
  }, [activities])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const loadPocket = useCallback(async () => {
    setIsLoading(true)
    try {
      const [nextOverview, nextWallets, nextActivities, nextTransactions] = await Promise.all([
        getPocketOverview(),
        listWallets(),
        listActivities(activityStatus),
        listTransactions(),
      ])
      setOverview(nextOverview)
      setWallets(nextWallets)
      setActivities(nextActivities)
      setTransactions(nextTransactions)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [activityStatus, showToast])

  useEffect(() => {
    loadPocket()
  }, [loadPocket])

  const handleCreateWallet = async (event: FormEvent) => {
    event.preventDefault()
    if (!walletForm.name.trim()) return

    setIsSaving(true)
    try {
      await createWallet({
        name: walletForm.name.trim(),
        type: walletForm.type,
        provider: walletForm.provider.trim() || undefined,
        balance: walletForm.balance || '0',
      })
      setWalletForm({ name: '', type: 'CASH', provider: '', balance: '' })
      await loadPocket()
      showToast('Wallet created.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateActivity = async (event: FormEvent) => {
    event.preventDefault()
    if (!activityName.trim()) return

    setIsSaving(true)
    try {
      await createActivity({ name: activityName.trim() })
      setActivityName('')
      await loadPocket()
      showToast('Activity created.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateTransaction = async (event: FormEvent) => {
    event.preventDefault()
    const amount = Number(transactionForm.amount)
    if (!amount || amount <= 0) return

    setIsSaving(true)
    try {
      await createTransaction({
        type: transactionForm.type,
        amount,
        sourceWalletId:
          transactionForm.type !== 'INCOME' ? transactionForm.sourceWalletId || undefined : undefined,
        destinationWalletId:
          transactionForm.type !== 'EXPENSE' ? transactionForm.destinationWalletId || undefined : undefined,
        activityId: transactionForm.activityId || undefined,
        description: transactionForm.description.trim() || undefined,
        occurredAt: new Date().toISOString(),
      })
      setTransactionForm({
        type: 'EXPENSE',
        amount: '',
        sourceWalletId: '',
        destinationWalletId: '',
        activityId: '',
        description: '',
      })
      await loadPocket()
      showToast('Transaction recorded.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWallet = async (walletId: string) => {
    try {
      await deleteWallet(walletId)
      await loadPocket()
      showToast('Wallet deleted.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId)
      await loadPocket()
      showToast('Activity archived.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  const handleRestoreActivity = async (activityId: string) => {
    try {
      await restoreActivity(activityId)
      await loadPocket()
      showToast('Activity restored.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId)
      await loadPocket()
      showToast('Transaction removed.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase font-bold">Pocket</p>
            <h2 className="text-2xl font-bold text-zinc-950 mt-1">Personal finance workspace</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {currentUser.fullName} can track wallets, activities, and cash movement here.
            </p>
          </div>

          <button
            onClick={loadPocket}
            className="self-start lg:self-auto flex items-center gap-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold px-3 py-2 rounded transition-all"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Balance" value={formatMoney(overview.totalBalance)} tone="dark" />
          <StatCard label="Income" value={formatMoney(overview.income)} tone="green" />
          <StatCard label="Expense" value={formatMoney(overview.expense)} tone="red" />
          <StatCard label="Wallets" value={overview.walletCount.toString()} tone="zinc" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Wallets" icon={WalletCards}>
              <form onSubmit={handleCreateWallet} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
                <input
                  value={walletForm.name}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Wallet name"
                  className="md:col-span-2 px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <select
                  value={walletForm.type}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, type: e.target.value as WalletType }))}
                  className="px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  {Object.entries(walletTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  value={walletForm.balance}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, balance: e.target.value }))}
                  placeholder="Opening balance"
                  inputMode="decimal"
                  className="px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  disabled={isSaving}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 text-xs font-bold rounded px-3 py-2 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isLoading && <SkeletonRows />}
                {!isLoading && activeWallets.length === 0 && <EmptyState label="No wallets yet." />}
                {!isLoading &&
                  activeWallets.map((wallet) => {
                    const Icon = getWalletIcon(wallet.type)
                    return (
                      <article key={wallet.id} className="border border-zinc-200 rounded-lg bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded bg-zinc-900 text-white flex items-center justify-center">
                              <Icon size={17} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-zinc-950">{wallet.name}</h3>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {walletTypeLabels[wallet.type]}
                                {wallet.provider ? ` / ${wallet.provider}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWallet(wallet.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete wallet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="mt-4 text-xl font-bold text-zinc-950">{formatMoney(wallet.balance)}</p>
                      </article>
                    )
                  })}
              </div>
            </Panel>

            <Panel title="Transactions" icon={ArrowRightLeft}>
              <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
                <select
                  value={transactionForm.type}
                  onChange={(e) =>
                    setTransactionForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))
                  }
                  className="px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  {Object.entries(transactionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Amount"
                  inputMode="decimal"
                  className="px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                {transactionForm.type !== 'INCOME' && (
                  <WalletSelect
                    value={transactionForm.sourceWalletId}
                    wallets={activeWallets}
                    placeholder="Source wallet"
                    onChange={(value) => setTransactionForm((prev) => ({ ...prev, sourceWalletId: value }))}
                  />
                )}
                {transactionForm.type !== 'EXPENSE' && (
                  <WalletSelect
                    value={transactionForm.destinationWalletId}
                    wallets={activeWallets}
                    placeholder="Destination wallet"
                    onChange={(value) => setTransactionForm((prev) => ({ ...prev, destinationWalletId: value }))}
                  />
                )}
                <select
                  value={transactionForm.activityId}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, activityId: e.target.value }))}
                  className="px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="">Activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={isSaving}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 text-xs font-bold rounded px-3 py-2 flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Record
                </button>
                <input
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="md:col-span-6 px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </form>

              <div className="space-y-3">
                {isLoading && <SkeletonRows />}
                {!isLoading && transactions.length === 0 && <EmptyState label="No transactions recorded." />}
                {!isLoading &&
                  transactions.map((transaction) => {
                    const Icon = getTransactionIcon(transaction.type)
                    const isExpense = transaction.type === 'EXPENSE'
                    return (
                      <article
                        key={transaction.id}
                        className="border border-zinc-200 rounded-lg bg-white p-4 flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded flex items-center justify-center ${
                              isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            <Icon size={17} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-zinc-950 truncate">
                              {transaction.description || transactionLabels[transaction.type]}
                            </h3>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {formatDate(transaction.occurredAt)}
                              {transaction.activityId
                                ? ` / ${activityNameById.get(transaction.activityId) || 'Activity'}`
                                : ''}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-1 truncate">
                              {walletNameById.get(transaction.sourceWalletId || '') || 'External'}
                              {' -> '}
                              {walletNameById.get(transaction.destinationWalletId || '') || 'External'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold ${isExpense ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isExpense ? '-' : '+'}
                            {formatMoney(transaction.amount)}
                          </p>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="mt-2 text-[11px] text-zinc-400 hover:text-red-600 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  })}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="By Wallet Type" icon={WalletCards}>
              <div className="space-y-3">
                {(Object.keys(walletTypeLabels) as WalletType[]).map((type) => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-600">{walletTypeLabels[type]}</span>
                    <span className="font-mono text-zinc-950">{formatMoney(overview.byType[type] ?? 0)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Activities" icon={Tag}>
              <div className="flex gap-1 mb-4 bg-zinc-100 p-1 rounded">
                {(['active', 'deleted'] as ActivityStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActivityStatus(status)}
                    className={`flex-1 text-[11px] font-bold rounded px-2 py-1.5 capitalize ${
                      activityStatus === status ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreateActivity} className="flex gap-2 mb-4">
                <input
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Activity name"
                  className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  disabled={isSaving}
                  className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-300 text-xs font-bold rounded px-3 py-2"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {activities.length === 0 && <EmptyState label="No activities in this view." />}
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-2 border border-zinc-100 rounded p-2 text-xs"
                  >
                    <span className="font-bold text-zinc-700 capitalize truncate">{activity.name}</span>
                    {activity.isDeleted ? (
                      <button
                        onClick={() => handleRestoreActivity(activity.id)}
                        className="text-[11px] text-emerald-700 font-bold"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-[11px] text-red-500 font-bold"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'dark' | 'green' | 'red' | 'zinc' }) {
  const toneClass = {
    dark: 'bg-zinc-950 text-white border-zinc-950',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    zinc: 'bg-white text-zinc-950 border-zinc-200',
  }[tone]

  return (
    <article className={`border rounded-lg p-4 ${toneClass}`}>
      <p className="text-[10px] font-mono uppercase font-bold opacity-70">{label}</p>
      <p className="text-xl font-bold mt-2">{value}</p>
    </article>
  )
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <section className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-zinc-600" />
        <h3 className="text-sm font-bold text-zinc-950">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function WalletSelect({
  value,
  wallets,
  placeholder,
  onChange,
}: {
  value: string
  wallets: Wallet[]
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-xs border border-zinc-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
    >
      <option value="">{placeholder}</option>
      {wallets.map((wallet) => (
        <option key={wallet.id} value={wallet.id}>
          {wallet.name}
        </option>
      ))}
    </select>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg bg-white">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div key={item} className="border border-zinc-200 rounded-lg bg-white p-4 animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-1/2" />
          <div className="h-3 bg-zinc-100 rounded w-full" />
        </div>
      ))}
    </>
  )
}

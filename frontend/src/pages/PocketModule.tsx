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
import { motion, AnimatePresence } from 'framer-motion'
import { getApiErrorMessage } from '../lib/apiClient'
import { ToastContainer } from '.'
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
import { Toast, User } from '../types/project'

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
    currency: 'TSH',
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

export default function PocketModule({ currentUser }: PocketModuleProps) {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-4">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-[0.24em]">Pocket</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Personal finance workspace</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              {currentUser.fullName} can track wallets, activities, and cash movement here.
            </p>
          </div>

          <button
            onClick={loadPocket}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 md:self-auto"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total balance" value={formatMoney(overview.totalBalance)} tone="dark" />
          <StatCard label="Income" value={formatMoney(overview.income)} tone="green" />
          <StatCard label="Expense" value={formatMoney(overview.expense)} tone="red" />
          <StatCard label="Wallets" value={overview.walletCount.toString()} tone="light" />
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <Panel title="Wallets" icon={WalletCards} subtitle="Where your money lives">
              <form onSubmit={handleCreateWallet} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                <input
                  value={walletForm.name}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Wallet name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 md:col-span-2"
                />
                <select
                  value={walletForm.type}
                  onChange={(e) => setWalletForm((prev) => ({ ...prev, type: e.target.value as WalletType }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
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
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
                />
                <button
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} /> Add
                </button>
              </form>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {isLoading && <SkeletonRows />}
                {!isLoading && activeWallets.length === 0 && <EmptyState label="No wallets yet. Add one to get started." />}
                {!isLoading &&
                  activeWallets.map((wallet) => {
                    const Icon = getWalletIcon(wallet.type)
                    return (
                      <motion.article
                        key={wallet.id}
                        whileHover={{ y: -2 }}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner shadow-indigo-100/80">
                              <Icon size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">{wallet.name}</h3>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {walletTypeLabels[wallet.type]}
                                {wallet.provider ? ` · ${wallet.provider}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteWallet(wallet.id)}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete wallet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="mt-4 text-2xl font-semibold text-slate-900">{formatMoney(wallet.balance)}</p>
                      </motion.article>
                    )
                  })}
              </div>
            </Panel>

            <Panel title="Transactions" icon={ArrowRightLeft} subtitle="Income, expenses, and transfers">
              <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 gap-2 md:grid-cols-6">
                <select
                  value={transactionForm.type}
                  onChange={(e) =>
                    setTransactionForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
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
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
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
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
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
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={16} /> Record
                </button>
                <input
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 md:col-span-6"
                />
              </form>

              <div className="mt-4 space-y-3">
                {isLoading && <SkeletonRows />}
                {!isLoading && transactions.length === 0 && <EmptyState label="No transactions recorded yet." />}
                {!isLoading &&
                  transactions.map((transaction) => {
                    const Icon = getTransactionIcon(transaction.type)
                    const isExpense = transaction.type === 'EXPENSE'
                    return (
                      <motion.article
                        key={transaction.id}
                        whileHover={{ y: -2 }}
                        className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                              isExpense ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {transaction.description || transactionLabels[transaction.type]}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(transaction.occurredAt)}
                              {transaction.activityId
                                ? ` · ${activityNameById.get(transaction.activityId) || 'Activity'}`
                                : ''}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {walletNameById.get(transaction.sourceWalletId || '') || 'External'}
                              {' → '}
                              {walletNameById.get(transaction.destinationWalletId || '') || 'External'}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-semibold ${isExpense ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {isExpense ? '-' : '+'}
                            {formatMoney(transaction.amount)}
                          </p>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="mt-2 text-xs font-semibold text-slate-400 transition hover:text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.article>
                    )
                  })}
              </div>
            </Panel>
          </div>

          <aside className="space-y-4">
            <Panel title="By wallet type" icon={WalletCards}>
              <div className="space-y-3">
                {(Object.keys(walletTypeLabels) as WalletType[]).map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-600">{walletTypeLabels[type]}</span>
                    <span className="font-semibold text-slate-900">{formatMoney(overview.byType[type] ?? 0)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Activities" icon={Tag} subtitle="Tag transactions by purpose">
              <div className="mb-4 flex gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {(['active', 'deleted'] as ActivityStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setActivityStatus(status)}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold capitalize transition ${
                      activityStatus === status ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreateActivity} className="mb-4 flex gap-2">
                <input
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Activity name"
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
                />
                <button
                  disabled={isSaving}
                  className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {activities.length === 0 && <EmptyState label="No activities in this view." />}
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="truncate font-medium capitalize text-slate-700">{activity.name}</span>
                    {activity.isDeleted ? (
                      <button
                        onClick={() => handleRestoreActivity(activity.id)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-600"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'dark' | 'green' | 'red' | 'light' }) {
  const toneClass = {
    dark: 'bg-slate-950 text-white border-slate-950',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    light: 'bg-white text-slate-900 border-slate-200',
  }[tone]

  return (
    <motion.article whileHover={{ y: -2 }} className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm uppercase tracking-[0.24em] opacity-60">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </motion.article>
  )
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
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
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
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
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      {label}
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="h-4 w-1/2 rounded-full bg-slate-200" />
          <div className="h-3 w-full rounded-full bg-slate-100" />
        </div>
      ))}
    </>
  )
}
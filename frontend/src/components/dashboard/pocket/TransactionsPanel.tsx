import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { PocketActivity, PocketTransaction, TransactionType, Wallet } from '../../../types/pocket'
import { formatDate, formatMoney, getTransactionIcon, transactionLabels } from '../../../utils/pocket'
import { EmptyState, Panel, SkeletonRows, WalletSelect } from './PocketPrimitives'

const PAGE_SIZE = 6

interface TransactionsPanelProps {
  transactions: PocketTransaction[]
  wallets: Wallet[]
  activities: PocketActivity[]
  isLoading: boolean
  isSaving: boolean
  onCreate: (payload: {
    type: TransactionType
    amount: number
    sourceWalletId?: string
    destinationWalletId?: string
    activityId?: string
    description?: string
  }) => Promise<boolean>
  onDelete: (transactionId: string) => void
}

export function TransactionsPanel({
  transactions,
  wallets,
  activities,
  isLoading,
  isSaving,
  onCreate,
  onDelete,
}: TransactionsPanelProps) {
  const [transactionForm, setTransactionForm] = useState({
    type: 'EXPENSE' as TransactionType,
    amount: '',
    sourceWalletId: '',
    destinationWalletId: '',
    activityId: '',
    description: '',
  })
  const [page, setPage] = useState(1)

  const walletNameById = useMemo(() => new Map(wallets.map((wallet) => [wallet.id, wallet.name])), [wallets])
  const activityNameById = useMemo(
    () => new Map(activities.map((activity) => [activity.id, activity.name])),
    [activities],
  )

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedTransactions = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const amount = Number(transactionForm.amount)
    if (!amount || amount <= 0) return

    const created = await onCreate({
      type: transactionForm.type,
      amount,
      sourceWalletId: transactionForm.type !== 'INCOME' ? transactionForm.sourceWalletId || undefined : undefined,
      destinationWalletId:
        transactionForm.type !== 'EXPENSE' ? transactionForm.destinationWalletId || undefined : undefined,
      activityId: transactionForm.activityId || undefined,
      description: transactionForm.description.trim() || undefined,
    })

    if (created) {
      setTransactionForm({
        type: 'EXPENSE',
        amount: '',
        sourceWalletId: '',
        destinationWalletId: '',
        activityId: '',
        description: '',
      })
      setPage(1)
    }
  }

  return (
    <Panel title="Transactions" icon={ArrowRightLeft} subtitle="Income, expenses, and transfers">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 md:grid-cols-6">
        <select
          value={transactionForm.type}
          onChange={(e) => setTransactionForm((prev) => ({ ...prev, type: e.target.value as TransactionType }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
        />
        {transactionForm.type !== 'INCOME' && (
          <WalletSelect
            value={transactionForm.sourceWalletId}
            wallets={wallets}
            placeholder="Source wallet"
            onChange={(value) => setTransactionForm((prev) => ({ ...prev, sourceWalletId: value }))}
          />
        )}
        {transactionForm.type !== 'EXPENSE' && (
          <WalletSelect
            value={transactionForm.destinationWalletId}
            wallets={wallets}
            placeholder="Destination wallet"
            onChange={(value) => setTransactionForm((prev) => ({ ...prev, destinationWalletId: value }))}
          />
        )}
        <select
          value={transactionForm.activityId}
          onChange={(e) => setTransactionForm((prev) => ({ ...prev, activityId: e.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 md:col-span-6"
        />
      </form>

      <div className="mt-4 space-y-3">
        {isLoading && <SkeletonRows />}
        {!isLoading && transactions.length === 0 && <EmptyState label="No transactions recorded yet." />}
        {!isLoading &&
          paginatedTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type)
            const isExpense = transaction.type === 'EXPENSE'
            return (
              <motion.article
                key={transaction.id}
                whileHover={{ y: -2 }}
                className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isExpense
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {transaction.description || transactionLabels[transaction.type]}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(transaction.occurredAt)}
                      {transaction.activityId
                        ? ` · ${activityNameById.get(transaction.activityId) || 'Activity'}`
                        : ''}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
                      {walletNameById.get(transaction.sourceWalletId || '') || 'External'}
                      {' → '}
                      {walletNameById.get(transaction.destinationWalletId || '') || 'External'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`break-words text-sm font-semibold ${isExpense ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {isExpense ? '-' : '+'}
                    {formatMoney(transaction.amount)}
                  </p>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="mt-2 text-xs font-semibold text-slate-400 transition hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </motion.article>
            )
          })}
      </div>

      {!isLoading && transactions.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} · {transactions.length} transactions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </Panel>
  )
}
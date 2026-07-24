import { FormEvent, useState } from 'react'
import { Plus, Trash2, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import { Wallet, WalletType } from '../../../types/pocket'
import { formatMoney, getWalletIcon, walletTypeLabels } from '../../../utils/pocket'
import { EmptyState, Panel, SkeletonRows } from './PocketPrimitives'

interface WalletsPanelProps {
  wallets: Wallet[]
  isLoading: boolean
  isSaving: boolean
  onCreate: (payload: { name: string; type: WalletType; provider?: string; balance: string }) => Promise<boolean>
  onDelete: (walletId: string) => void
}

export function WalletsPanel({ wallets, isLoading, isSaving, onCreate, onDelete }: WalletsPanelProps) {
  const [walletForm, setWalletForm] = useState({ name: '', type: 'CASH' as WalletType, provider: '', balance: '' })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!walletForm.name.trim()) return

    const created = await onCreate({
      name: walletForm.name.trim(),
      type: walletForm.type,
      provider: walletForm.provider.trim(),
      balance: walletForm.balance,
    })
    if (created) {
      setWalletForm({ name: '', type: 'CASH', provider: '', balance: '' })
    }
  }

  return (
    <Panel title="Wallets" icon={WalletCards} subtitle="Where your money lives">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <input
          value={walletForm.name}
          onChange={(e) => setWalletForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Wallet name"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 md:col-span-2"
        />
        <select
          value={walletForm.type}
          onChange={(e) => setWalletForm((prev) => ({ ...prev, type: e.target.value as WalletType }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
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
        {!isLoading && wallets.length === 0 && <EmptyState label="No wallets yet. Add one to get started." />}
        {!isLoading &&
          wallets.map((wallet) => {
            const Icon = getWalletIcon(wallet.type)
            return (
              <motion.article
                key={wallet.id}
                whileHover={{ y: -2 }}
                className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner shadow-indigo-100/80 dark:bg-indigo-950/60 dark:text-indigo-400 dark:shadow-none">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{wallet.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {walletTypeLabels[wallet.type]}
                        {wallet.provider ? ` · ${wallet.provider}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(wallet.id)}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                    title="Delete wallet"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-4 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {formatMoney(wallet.balance)}
                </p>
              </motion.article>
            )
          })}
      </div>
    </Panel>
  )
}
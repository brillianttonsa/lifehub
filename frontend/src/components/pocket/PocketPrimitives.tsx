import { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Wallet } from '../../types/pocket'

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'dark' | 'green' | 'red' | 'light'
}) {
  const toneClass = {
    dark: 'bg-slate-950 text-white border-slate-950',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    light: 'bg-white text-slate-900 border-slate-200',
  }[tone]

  return (
    <motion.article whileHover={{ y: -2 }} className={`min-w-0 rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <p className="truncate text-sm uppercase tracking-[0.24em] opacity-60">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold leading-tight sm:text-3xl">{value}</p>
    </motion.article>
  )
}

export function Panel({
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export function WalletSelect({
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

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      {label}
    </div>
  )
}

export function SkeletonRows() {
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
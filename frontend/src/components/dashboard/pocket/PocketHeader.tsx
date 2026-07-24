import { RefreshCw } from 'lucide-react'

export function PocketHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <section className="mx-4 my-4 flex flex-col gap-4 rounded-2xl bg-white p-4 text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100 sm:flex-row sm:items-end sm:justify-between border border-transparent dark:border-slate-800">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight">Personal finance workspace</h1>
      </div>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:cursor-pointer hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700/80 md:self-auto"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </section>
  )
}
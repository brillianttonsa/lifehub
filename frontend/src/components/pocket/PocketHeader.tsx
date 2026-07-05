import { RefreshCw } from 'lucide-react'

export function PocketHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <section className="flex flex-col gap-4  text-gray-800 p-4 rounded-2xl bg-white shadow-sm mx-4 my-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        
        <h1 className="text-3xl font-semibold tracking-tight">Personal finance workspace</h1>
        
      </div>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 self-start rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-blue-700 hover:cursor-pointer shadow-sm backdrop-blur transition hover:bg-white/20 md:self-auto"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </section>
  )
}
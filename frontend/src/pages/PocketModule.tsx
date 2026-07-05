import { ToastContainer } from '../components/projects/Toast'
import { usePocketData } from '../hooks/UsePocketData'
import { PocketHeader } from '../components/pocket/PocketHeader'
import { StatCard } from '../components/pocket/PocketPrimitives'
import { WalletsPanel } from '../components/pocket/WalletsPanelProps'
import { TransactionsPanel } from '../components/pocket/TransactionsPanel'
import { ActivitiesPanel } from '../components/pocket/ActivitiesPanel'
import { TypeBreakdownPanel } from '../components/pocket/TypeBreakDownPanel'
import { formatMoney } from '../utils/pocket'


export default function PocketModule() {
  const {
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
    reloadAll,
    createWalletEntry,
    removeWallet,
    createActivityEntry,
    archiveActivity,
    restoreActivityEntry,
    createTransactionEntry,
    removeTransaction,
  } = usePocketData()

  const activeWallets = wallets.filter((wallet) => !wallet.isDeleted)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 ">
      <div className="max-w-[1440px] mx-auto space-y-4">
        <PocketHeader onRefresh={reloadAll} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 px-4 py-6 sm:px-6 lg:px-8">
          <StatCard label="Total balance" value={formatMoney(overview.totalBalance)} tone="dark" />
          <StatCard label="Income" value={formatMoney(overview.income)} tone="green" />
          <StatCard label="Expense" value={formatMoney(overview.expense)} tone="red" />
          <StatCard label="Wallets" value={overview.walletCount.toString()} tone="light" />
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr] px-4">
          <div className="space-y-4">
            <WalletsPanel
              wallets={activeWallets}
              isLoading={isLoading}
              isSaving={isSaving}
              onCreate={createWalletEntry}
              onDelete={removeWallet}
            />

            <TransactionsPanel
              transactions={transactions}
              wallets={activeWallets}
              activities={activeActivities}
              isLoading={isLoading}
              isSaving={isSaving}
              onCreate={createTransactionEntry}
              onDelete={removeTransaction}
            />
          </div>

          <aside className="space-y-4">
            <TypeBreakdownPanel overview={overview} />

            <ActivitiesPanel
              activities={activities}
              activityStatus={activityStatus}
              isSaving={isSaving}
              onStatusChange={setActivityStatus}
              onCreate={createActivityEntry}
              onArchive={archiveActivity}
              onRestore={restoreActivityEntry}
            />
          </aside>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
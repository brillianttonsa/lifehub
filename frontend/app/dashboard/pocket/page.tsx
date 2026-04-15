'use client';

import { useState } from 'react';
import { Plus, Wallet as WalletIcon, History, LayoutDashboard } from 'lucide-react';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Our New Architecture
import { useWallets } from '@/hooks/pocket/use-wallets';
import { useTransactions } from '@/hooks/pocket/use-transactions.ts';
import { WalletList } from '@/components/pocket/wallet-list';
import { TransactionList } from '@/components/pocket/transaction-list';
import { WalletDialog } from '@/components/pocket/wallet-dialog';
import { TransactionDialog } from '@/components/pocket/transaction-dialog';
import { Wallet, Transaction } from '@/types/pocket';

export default function PocketPage() {
  // 1. Logic Hooks
  // We pass fetchWallets into useTransactions so that every time a transaction 
  // is deleted or changed, the Wallet balances refresh automatically.
  const { 
    wallets, 
    loading: wLoading, 
    fetchWallets, 
    deleteWallet 
  } = useWallets();

  const { 
    transactions, 
    loading: tLoading, 
    fetchTransactions, 
    deleteTransaction 
  } = useTransactions(fetchWallets);

  // 2. State for Dialogs
  const [wDialogOpen, setWDialogOpen] = useState(false);
  const [tDialogOpen, setTDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // 3. Helper Handlers
  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTDialogOpen(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setTDialogOpen(true);
  };

  const handleNewWallet = () => {
    setEditingWallet(null);
    setWDialogOpen(true);
  };

  // 4. Loading State
  if (wLoading || tLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pocket</h1>
          <p className="text-muted-foreground italic">
            Your personal accounting engine and ledger system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleNewWallet}>
            <Plus className="h-4 w-4 mr-2" />
            New Wallet
          </Button>
          <Button onClick={handleNewTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Record Transaction
          </Button>
        </div>
      </header>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <WalletIcon className="h-4 w-4 mr-2" /> Wallets
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" /> History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab: Quick view of everything */}
        <TabsContent value="overview" className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Active Wallets</h2>
            <WalletList 
              wallets={wallets.slice(0, 3)} 
              onEdit={handleEditWallet} 
              onDelete={deleteWallet}
              onAdd={handleNewWallet}
            />
          </section>
          
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <TransactionList 
              transactions={transactions.slice(0, 5)} 
              onEdit={handleEditTransaction} 
              onDelete={deleteTransaction} 
            />
          </section>
        </TabsContent>

        {/* Dedicated Wallets Tab */}
        <TabsContent value="wallets">
          <WalletList 
            wallets={wallets} 
            onEdit={handleEditWallet} 
            onDelete={deleteWallet}
            onAdd={handleNewWallet}
          />
        </TabsContent>

        {/* Dedicated Transactions Tab */}
        <TabsContent value="transactions">
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditTransaction} 
            onDelete={deleteTransaction} 
          />
        </TabsContent>
      </Tabs>

      {/* Modals / Dialogs */}
      <WalletDialog 
        open={wDialogOpen} 
        onOpenChange={setWDialogOpen} 
        editingWallet={editingWallet}
        onSuccess={fetchWallets} 
      />

      <TransactionDialog 
        open={tDialogOpen} 
        onOpenChange={setTDialogOpen} 
        editingTransaction={editingTransaction}
        wallets={wallets}
        onSuccess={() => {
          fetchTransactions();
          fetchWallets(); // Double sync to ensure ledger balances are correct
        }} 
      />
    </div>
  );
}
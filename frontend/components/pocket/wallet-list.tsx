'use client';

import { WalletCard } from './wallet-card';
import { Wallet } from '@/types/pocket';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletListProps {
  wallets: Wallet[];
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function WalletList({ wallets, onEdit, onDelete, onAdd }: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl space-y-4">
        <p className="text-muted-foreground text-sm">No wallets found in your ledger.</p>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" /> Create your first wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <WalletCard 
          key={wallet.id} 
          wallet={wallet} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
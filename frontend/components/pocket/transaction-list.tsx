'use client';

import { TransactionItem } from './transaction-item';
import { Transaction } from '@/types/pocket';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center p-12 bg-muted/30 rounded-lg border">
        <p className="text-muted-foreground italic text-sm">No transactions recorded yet.</p>
      </div>
    );
  }

  // Optional: Group by date (highly recommended for accounting apps)
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
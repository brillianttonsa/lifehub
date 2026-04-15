'use client';

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/pocket';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const getIcon = (kind: string) => {
    switch (kind) {
      case 'INCOME': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'EXPENSE': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'TRANSFER': return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center space-x-4">
        {getIcon(transaction.kind)}
        <div>
          <p className="text-sm font-medium">{transaction.description || 'No description'}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(transaction.occurredAt), 'MMM dd, yyyy HH:mm')}
          </p>
          <p className="text-xs font-semibold text-primary/80">
            {transaction.kind === 'TRANSFER' 
              ? `${transaction.sourceWallet?.name} → ${transaction.destinationWallet?.name}`
              : transaction.sourceWallet?.name || transaction.destinationWallet?.name
            }
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="text-right mr-2">
          <p className={`text-sm font-bold ${
            transaction.kind === 'INCOME' ? 'text-green-600' :
            transaction.kind === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {transaction.kind === 'EXPENSE' ? '-' : transaction.kind === 'INCOME' ? '+' : ''}
            TZS {transaction.amount.toLocaleString()}
          </p>
          <Badge variant="secondary" className="text-[10px] h-4">
            {transaction.kind}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
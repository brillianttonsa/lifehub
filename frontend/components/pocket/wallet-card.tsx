'use client';

import { MoreHorizontal, Banknote, Building2, Smartphone, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet } from '@/types/pocket';

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: string) => void;
}

export function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'CASH': return <Banknote className="h-4 w-4" />;
      case 'BANK': return <Building2 className="h-4 w-4" />;
      case 'MOBILE_MONEY': return <Smartphone className="h-4 w-4" />;
      default: return <WalletIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {getIcon(wallet.type)}
          <CardTitle className="text-sm font-medium">{wallet.name}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(wallet)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(wallet.id)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">TZS {wallet.balance.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {wallet.type} {wallet.provider && `• ${wallet.provider}`}
        </p>
      </CardContent>
    </Card>
  );
}
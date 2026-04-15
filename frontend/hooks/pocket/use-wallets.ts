import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Wallet } from '@/types/pocket';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallets = useCallback(async () => {
    try {
      const response = await api.get<Wallet[]>('/api/v1/pocket/wallets');
      const normalized = response.data.map(wallet => ({
        ...wallet,
        balance: typeof wallet.balance === 'string' ? parseFloat(wallet.balance) : wallet.balance,
      }));
      setWallets(normalized);
    } catch (error) {
      toast.error('Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const deleteWallet = async (id: string) => {
    try {
      await api.deleteWallet(id);
      setWallets(prev => prev.filter(w => w.id !== id));
      toast.success('Wallet deleted');
    } catch (error) {
      toast.error('Failed to delete wallet');
    }
  };

  return { wallets, loading, fetchWallets, deleteWallet, setWallets };
}
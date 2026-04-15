import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Transaction } from '@/types/pocket';

export function useTransactions(onLedgerUpdate?: () => void) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get<Transaction[]>('/api/v1/pocket/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`/api/v1/pocket/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
      
      // CRITICAL: Refresh wallets because the backend reversed the ledger
      if (onLedgerUpdate) onLedgerUpdate(); 
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  return { transactions, loading, fetchTransactions, deleteTransaction };
}
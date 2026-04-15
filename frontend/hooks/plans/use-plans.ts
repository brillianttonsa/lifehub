import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Plan } from '@/types/plans';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getPlans();
      setPlans(response.data);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, fetchPlans, setPlans };
}


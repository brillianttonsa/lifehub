import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { HabitSet } from '@/types/habits';

export function useHabitSets() {
  const [habitSets, setHabitSets] = useState<HabitSet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabitSets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getHabitSets();
      setHabitSets(response.data);
    } catch {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabitSets();
  }, [fetchHabitSets]);

  return { habitSets, loading, fetchHabitSets, setHabitSets };
}


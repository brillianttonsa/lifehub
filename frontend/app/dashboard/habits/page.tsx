'use client';

import { Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { CreateHabitSetDialog } from '@/components/habits/create-habit-set-dialog';
import { HabitSetsList, HabitsStats } from '@/components/habits/habit-sets-list';
import { useHabitSets } from '@/hooks/habits/use-habit-sets';

export default function HabitsPage() {
  const { habitSets, loading, fetchHabitSets } = useHabitSets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground mt-1">
            Build lasting habits with daily tracking
          </p>
        </div>
        <CreateHabitSetDialog onSuccess={fetchHabitSets} />
      </div>

      {/* Stats Cards */}
      <HabitsStats habitSets={habitSets} />

      {/* Habit Sets */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-32 rounded-lg bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : habitSets.length > 0 ? (
        <HabitSetsList habitSets={habitSets} />
      ) : (
        <Card>
          <CardContent className="py-16">
            <Empty
              icon={Target}
              title="No habit sets yet"
              description="Create your first habit set to start tracking your daily habits"
            >
              <CreateHabitSetDialog onSuccess={fetchHabitSets} />
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

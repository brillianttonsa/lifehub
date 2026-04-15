'use client';

import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Circle, Flame, MoreHorizontal, Target } from 'lucide-react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type { CheckIn, HabitSet } from '@/types/habits';

type Props = {
  habitSets: HabitSet[];
};

export function HabitSetsList({ habitSets }: Props) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);

  const today = useMemo(() => new Date(), []);

  const getCheckInStatus = (habitId: string, date: Date) => {
    return checkIns.find((c) => c.habitId === habitId && isSameDay(new Date(c.date), date))?.status;
  };

  const handleCheckin = async (habitId: string, date: Date, status: 'DONE' | 'NOT_DONE') => {
    try {
      await api.createHabitCheckin({
        habitId,
        checkinDate: date.toISOString(),
        status,
      });

      setCheckIns((prev) => [
        ...prev.filter((c) => !(c.habitId === habitId && isSameDay(new Date(c.date), date))),
        { habitId, date: date.toISOString(), status },
      ]);

      toast.success(status === 'DONE' ? 'Marked as done!' : 'Marked as not done');
    } catch {
      toast.error('Failed to update check-in');
    }
  };

  if (habitSets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {habitSets.map((set) => (
        <Card key={set.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {set.title}
                <Badge variant="secondary" className="font-normal">
                  {set.cycleLength} {set.cycleUnit.toLowerCase()}
                  {set.cycleLength > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              {set.goalDescription && <CardDescription className="mt-1">{set.goalDescription}</CardDescription>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-8 gap-2 text-center">
                <div className="text-sm font-medium text-muted-foreground">Habit</div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`text-sm font-medium ${isSameDay(day, today) ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-xs">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>

              {set.habits.map((habit) => (
                <div key={habit.id} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-sm font-medium truncate pr-2">
                    {habit.name}
                    {habit.targetCountPerDay > 1 && (
                      <span className="text-xs text-muted-foreground ml-1">({habit.targetCountPerDay}x)</span>
                    )}
                  </div>
                  {weekDays.map((day) => {
                    const status = getCheckInStatus(habit.id, day);
                    const isPast = day < today && !isSameDay(day, today);
                    const isFuture = day > today;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          if (isFuture) return;
                          const next = status === 'DONE' ? 'NOT_DONE' : 'DONE';
                          handleCheckin(habit.id, day, next);
                        }}
                        disabled={isFuture}
                        className={`flex items-center justify-center h-10 rounded-lg transition-colors ${
                          status === 'DONE'
                            ? 'bg-success/20 text-success'
                            : status === 'NOT_DONE'
                              ? 'bg-muted text-muted-foreground'
                              : isPast
                                ? 'bg-destructive/10 text-destructive/50'
                                : isFuture
                                  ? 'bg-muted/50 text-muted-foreground/30'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {status === 'DONE' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Weekly Progress</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function HabitsStats({ habitSets }: { habitSets: HabitSet[] }) {
  const activeHabits = habitSets.reduce((acc, set) => acc + set.habits.length, 0);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-1/10">
              <Target className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeHabits}</p>
              <p className="text-sm text-muted-foreground">Active Habits</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Flame className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10">
              <Calendar className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{habitSets.length}</p>
              <p className="text-sm text-muted-foreground">Habit Sets</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

type Habit = {
  id: string;
  name: string;
  targetCountPerDay: number;
};

type HabitSet = {
  id: string;
  workspaceId: string;
  title: string;
  goalDescription?: string;
  cycleUnit: string;
  cycleLength: number;
  startDate: string;
  endDate: string;
  status: string;
  habits: Habit[];
};

type CheckIn = {
  habitId: string;
  date: string;
  status: 'DONE' | 'SKIPPED' | 'MISSED';
};

export default function HabitsPage() {
  const { currentWorkspace } = useAuth();
  const [habitSets, setHabitSets] = useState<HabitSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [cycleUnit, setCycleUnit] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [cycleLength, setCycleLength] = useState('1');
  const [habits, setHabits] = useState<Array<{ name: string; targetCountPerDay: string }>>([
    { name: '', targetCountPerDay: '1' },
  ]);

  const fetchHabitSets = async () => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    try {
      const response = await api.getHabitSets();
      if (response.success) {
        setHabitSets(response.data);
      }
    } catch {
      toast.error('Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitSets();
  }, [currentWorkspace]);

  const resetForm = () => {
    setTitle('');
    setGoalDescription('');
    setCycleUnit('WEEK');
    setCycleLength('1');
    setHabits([{ name: '', targetCountPerDay: '1' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validHabits = habits.filter((h) => h.name.trim());
      if (validHabits.length === 0) {
        toast.error('Add at least one habit');
        return;
      }

      await api.createHabitSet({
        title,
        goalDescription: goalDescription || undefined,
        cycleUnit,
        cycleLength: parseInt(cycleLength),
        startDate: new Date().toISOString(),
        habits: validHabits.map((h) => ({
          name: h.name,
          targetCountPerDay: parseInt(h.targetCountPerDay) || 1,
        })),
      });

      toast.success('Habit set created!');
      setIsDialogOpen(false);
      resetForm();
      fetchHabitSets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create habit set');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addHabitField = () => {
    setHabits([...habits, { name: '', targetCountPerDay: '1' }]);
  };

  const removeHabitField = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const updateHabitField = (
    index: number,
    field: 'name' | 'targetCountPerDay',
    value: string
  ) => {
    const updated = [...habits];
    updated[index][field] = value;
    setHabits(updated);
  };

  const handleCheckin = async (habitId: string, date: Date, status: 'DONE' | 'SKIPPED') => {
    try {
      await api.createHabitCheckin({
        habitId,
        checkinDate: date.toISOString(),
        status,
      });

      setCheckIns([
        ...checkIns.filter(
          (c) => !(c.habitId === habitId && isSameDay(new Date(c.date), date))
        ),
        { habitId, date: date.toISOString(), status },
      ]);

      toast.success(status === 'DONE' ? 'Marked as done!' : 'Marked as skipped');
    } catch {
      toast.error('Failed to update check-in');
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();
  const today = new Date();

  const getCheckInStatus = (habitId: string, date: Date) => {
    return checkIns.find(
      (c) => c.habitId === habitId && isSameDay(new Date(c.date), date)
    )?.status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground mt-1">
            Build lasting habits with daily tracking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Habit Set
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Habit Set</DialogTitle>
              <DialogDescription>
                Group related habits together and track them as a set
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    placeholder="e.g., Morning Routine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="goalDescription">
                    Goal Description (optional)
                  </FieldLabel>
                  <Textarea
                    id="goalDescription"
                    placeholder="What do you want to achieve?"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    rows={2}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Cycle Unit</FieldLabel>
                    <Select value={cycleUnit} onValueChange={(v) => setCycleUnit(v as typeof cycleUnit)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Day</SelectItem>
                        <SelectItem value="WEEK">Week</SelectItem>
                        <SelectItem value="MONTH">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="cycleLength">Cycle Length</FieldLabel>
                    <Input
                      id="cycleLength"
                      type="number"
                      min="1"
                      max="12"
                      value={cycleLength}
                      onChange={(e) => setCycleLength(e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FieldLabel>Habits</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHabitField}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {habits.map((habit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Habit name"
                        value={habit.name}
                        onChange={(e) =>
                          updateHabitField(index, 'name', e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Count"
                        value={habit.targetCountPerDay}
                        onChange={(e) =>
                          updateHabitField(index, 'targetCountPerDay', e.target.value)
                        }
                        className="w-20"
                      />
                      {habits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHabitField(index)}
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                {isSubmitting ? 'Creating...' : 'Create Habit Set'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-chart-1/10">
                <Target className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {habitSets.reduce((acc, set) => acc + set.habits.length, 0)}
                </p>
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

      {/* Habit Sets */}
      {isLoading ? (
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
                  {set.goalDescription && (
                    <CardDescription className="mt-1">
                      {set.goalDescription}
                    </CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 gap-2 text-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      Habit
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={day.toISOString()}
                        className={`text-sm font-medium ${
                          isSameDay(day, today)
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <div>{format(day, 'EEE')}</div>
                        <div className="text-xs">{format(day, 'd')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Habits Grid */}
                  {set.habits.map((habit) => (
                    <div key={habit.id} className="grid grid-cols-8 gap-2 items-center">
                      <div className="text-sm font-medium truncate pr-2">
                        {habit.name}
                        {habit.targetCountPerDay > 1 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({habit.targetCountPerDay}x)
                          </span>
                        )}
                      </div>
                      {weekDays.map((day) => {
                        const status = getCheckInStatus(habit.id, day);
                        const isPast = day < today && !isSameDay(day, today);
                        const isFuture = day > today;

                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() =>
                              !isFuture &&
                              handleCheckin(
                                habit.id,
                                day,
                                status === 'DONE' ? 'SKIPPED' : 'DONE'
                              )
                            }
                            disabled={isFuture}
                            className={`flex items-center justify-center h-10 rounded-lg transition-colors ${
                              status === 'DONE'
                                ? 'bg-success/20 text-success'
                                : status === 'SKIPPED'
                                ? 'bg-muted text-muted-foreground'
                                : isPast
                                ? 'bg-destructive/10 text-destructive/50'
                                : isFuture
                                ? 'bg-muted/50 text-muted-foreground/30'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {status === 'DONE' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {/* Progress */}
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
      ) : (
        <Card>
          <CardContent className="py-16">
            <Empty
              icon={Target}
              title="No habit sets yet"
              description="Create your first habit set to start tracking your daily habits"
            >
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Habit Set
              </Button>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

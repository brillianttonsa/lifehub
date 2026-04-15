'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  onSuccess: () => void;
};

export function CreateHabitSetDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [cycleUnit, setCycleUnit] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [cycleLength, setCycleLength] = useState('1');
  const [habits, setHabits] = useState<Array<{ name: string; targetCountPerDay: string }>>([
    { name: '', targetCountPerDay: '1' },
  ]);

  const resetForm = () => {
    setTitle('');
    setGoalDescription('');
    setCycleUnit('WEEK');
    setCycleLength('1');
    setHabits([{ name: '', targetCountPerDay: '1' }]);
  };

  const addHabitField = () => setHabits((prev) => [...prev, { name: '', targetCountPerDay: '1' }]);
  const removeHabitField = (index: number) => setHabits((prev) => prev.filter((_, i) => i !== index));

  const updateHabitField = (index: number, field: 'name' | 'targetCountPerDay', value: string) => {
    setHabits((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
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
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create habit set');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Habit Set
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Habit Set</DialogTitle>
          <DialogDescription>Group related habits together and track them as a set</DialogDescription>
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
              <FieldLabel htmlFor="goalDescription">Goal Description (optional)</FieldLabel>
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
              <Button type="button" variant="outline" size="sm" onClick={addHabitField}>
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
                    onChange={(e) => updateHabitField(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Count"
                    value={habit.targetCountPerDay}
                    onChange={(e) => updateHabitField(index, 'targetCountPerDay', e.target.value)}
                    className="w-20"
                  />
                  {habits.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHabitField(index)}>
                      &times;
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner className="mr-2" /> : null}
            {submitting ? 'Creating...' : 'Create Habit Set'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


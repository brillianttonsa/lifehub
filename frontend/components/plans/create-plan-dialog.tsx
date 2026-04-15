'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  onSuccess: () => void;
};

function getPeriodDates(type: string) {
  const now = new Date();
  switch (type) {
    case 'DAILY':
      return { start: now, end: now };
    case 'WEEKLY':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'MONTHLY':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'YEARLY':
      return { start: startOfYear(now), end: endOfYear(now) };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

export function CreatePlanDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planType, setPlanType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  const resetForm = () => {
    setPlanTitle('');
    setPlanDescription('');
    setPlanType('MONTHLY');
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { start, end } = getPeriodDates(planType);
      await api.createPlan({
        type: planType,
        title: planTitle,
        description: planDescription || undefined,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
      });
      toast.success('Plan created!');
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Plan</DialogTitle>
          <DialogDescription>Create a new plan to organize your goals and tasks</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreatePlan} className="space-y-4 mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="planTitle">Title</FieldLabel>
              <Input
                id="planTitle"
                placeholder="e.g., April Goals"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="planDescription">Description (optional)</FieldLabel>
              <Textarea
                id="planDescription"
                placeholder="What do you want to achieve?"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={2}
              />
            </Field>
            <Field>
              <FieldLabel>Plan Type</FieldLabel>
              <Select value={planType} onValueChange={(v) => setPlanType(v as typeof planType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner className="mr-2" /> : null}
            {submitting ? 'Creating...' : 'Create Plan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


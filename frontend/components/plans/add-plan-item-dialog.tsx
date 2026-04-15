'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Plan } from '@/types/plans';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  onSuccess: () => void;
};

export function AddPlanItemDialog({ open, onOpenChange, plan, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemDueDate, setItemDueDate] = useState('');
  const [itemIsRecurring, setItemIsRecurring] = useState(false);
  const [lifetimePreset, setLifetimePreset] = useState<'NONE' | 'DAYS' | 'WEEK' | 'MONTH' | 'RANGE'>('NONE');
  const [lifetimeDays, setLifetimeDays] = useState('3');
  const [lifetimeRangeStart, setLifetimeRangeStart] = useState('');
  const [lifetimeRangeEnd, setLifetimeRangeEnd] = useState('');

  useEffect(() => {
    if (open) {
      setItemTitle('');
      setItemDescription('');
      setItemDueDate('');
      setItemIsRecurring(false);
      setLifetimePreset('NONE');
      setLifetimeDays('3');
      setLifetimeRangeStart('');
      setLifetimeRangeEnd('');
    }
  }, [open]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;

    setSubmitting(true);
    try {
      await api.addPlanItem(plan.id, {
        title: itemTitle,
        description: itemDescription || undefined,
        dueDate: itemDueDate ? new Date(itemDueDate).toISOString() : undefined,
        isRecurring: itemIsRecurring,
        lifetimePreset: lifetimePreset === 'NONE' ? undefined : (lifetimePreset as any),
        lifetimeValue: lifetimePreset === 'DAYS' ? parseInt(lifetimeDays) || 3 : undefined,
        lifetimeStart: lifetimePreset === 'RANGE' && lifetimeRangeStart ? new Date(lifetimeRangeStart).toISOString() : undefined,
        lifetimeEnd: lifetimePreset === 'RANGE' && lifetimeRangeEnd ? new Date(lifetimeRangeEnd).toISOString() : undefined,
      });

      toast.success('Item added!');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Plan Item</DialogTitle>
          <DialogDescription>Add a new item to {plan?.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddItem} className="space-y-4 mt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="itemTitle">Title</FieldLabel>
              <Input
                id="itemTitle"
                placeholder="e.g., Complete project proposal"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="itemDescription">Description (optional)</FieldLabel>
              <Textarea
                id="itemDescription"
                placeholder="Add more details..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                rows={2}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="itemDueDate">Due Date (optional)</FieldLabel>
              <Input
                id="itemDueDate"
                type="date"
                value={itemDueDate}
                onChange={(e) => setItemDueDate(e.target.value)}
              />
            </Field>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={itemIsRecurring}
                onCheckedChange={(checked) => setItemIsRecurring(checked as boolean)}
              />
              <label
                htmlFor="isRecurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This is a recurring item
              </label>
            </div>

            <Field>
              <FieldLabel>Lifetime</FieldLabel>
              <Select value={lifetimePreset} onValueChange={(v) => setLifetimePreset(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No lifetime</SelectItem>
                  <SelectItem value="DAYS">X days</SelectItem>
                  <SelectItem value="WEEK">1 week</SelectItem>
                  <SelectItem value="MONTH">1 month</SelectItem>
                  <SelectItem value="RANGE">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {lifetimePreset === 'DAYS' && (
              <Field>
                <FieldLabel>Days</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={lifetimeDays}
                  onChange={(e) => setLifetimeDays(e.target.value)}
                />
              </Field>
            )}

            {lifetimePreset === 'RANGE' && (
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Start</FieldLabel>
                  <Input type="date" value={lifetimeRangeStart} onChange={(e) => setLifetimeRangeStart(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>End</FieldLabel>
                  <Input type="date" value={lifetimeRangeEnd} onChange={(e) => setLifetimeRangeEnd(e.target.value)} />
                </Field>
              </div>
            )}
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Spinner className="mr-2" /> : null}
            {submitting ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


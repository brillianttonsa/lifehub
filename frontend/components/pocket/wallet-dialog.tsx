'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Wallet, WalletFormValues } from '@/types/pocket';

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWallet: Wallet | null;
  onSuccess: () => void;
}

export function WalletDialog({ open, onOpenChange, editingWallet, onSuccess }: WalletDialogProps) {
  const [form, setForm] = useState<WalletFormValues>({
    name: '',
    type: 'CASH',
    provider: '',
    balance: '0.00',
  });

  useEffect(() => {
    if (editingWallet) {
      setForm({
        name: editingWallet.name,
        type: editingWallet.type,
        provider: editingWallet.provider ?? '',
        balance: editingWallet.balance.toString(),
      });
    } else {
      setForm({ name: '', type: 'CASH', provider: '', balance: '0.00' });
    }
  }, [editingWallet, open]);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Wallet name is required');

    const payload = {
      ...form,
      provider: form.type === 'MOBILE_MONEY' ? form.provider : undefined,
      balance: parseFloat(form.balance) || 0,
    };

    try {
      if (editingWallet) {
        await api.updateWallet(editingWallet.id, payload);
        toast.success('Wallet updated');
      } else {
        await api.createWallet(payload);
        toast.success('Wallet created');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save wallet');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Create Wallet'}</DialogTitle>
          <DialogDescription>
            {editingWallet ? 'Update wallet details.' : 'Add a new wallet to track your finances.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <FieldGroup>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g., Main Wallet" 
              />
            </FieldGroup>
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <FieldGroup>
              <Select 
                value={form.type} 
                onValueChange={(v: any) => setForm({ ...form, type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </Field>

          {form.type === 'MOBILE_MONEY' && (
            <Field>
              <FieldLabel>Provider</FieldLabel>
              <FieldGroup>
                <Select 
                  value={form.provider} 
                  onValueChange={(v) => setForm({ ...form, provider: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AIRTEL">Airtel</SelectItem>
                    <SelectItem value="TIGO">Tigo</SelectItem>
                    <SelectItem value="HALOTEL">Halotel</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
            </Field>
          )}

          <Field>
            <FieldLabel>Initial Balance</FieldLabel>
            <FieldGroup>
              <Input 
                type="number" 
                value={form.balance} 
                onChange={(e) => setForm({ ...form, balance: e.target.value })} 
              />
            </FieldGroup>
          </Field>

          <Button onClick={handleSave} className="w-full">
            {editingWallet ? 'Update Wallet' : 'Create Wallet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { z } from 'zod';

export const createTransactionSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    amount: z.number().positive(),
    sourceWalletId: z.string().uuid().optional(),
    destinationWalletId: z.string().uuid().optional(),
    activityId: z.string().uuid().optional(),
    description: z.string().max(255).optional(),
    occurredAt: z.coerce.date(),
  })
  .refine(
    (data) => {
      if (data.type === 'EXPENSE') {
        return !!data.sourceWalletId;
      }
      return true;
    },
    { message: 'Expense requires source wallet' },
  )
  .refine(
    (data) => {
      if (data.type === 'INCOME') {
        return !!data.destinationWalletId;
      }
      return true;
    },
    { message: 'Income requires destination wallet' },
  )
  .refine(
    (data) => {
      if (data.type === 'TRANSFER') {
        return (
          !!data.sourceWalletId &&
          !!data.destinationWalletId &&
          data.sourceWalletId !== data.destinationWalletId
        );
      }
      return true;
    },
    { message: 'Invalid transfer configuration' },
  );

export const updateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),

  amount: z.number().positive().optional(),

  sourceWalletId: z.string().uuid().optional(),
  destinationWalletId: z.string().uuid().optional(),

  activityId: z.string().uuid().optional(),

  description: z.string().max(255).optional(),

  occurredAt: z.coerce.date().optional(),
});

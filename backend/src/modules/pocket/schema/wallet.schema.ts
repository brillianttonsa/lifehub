import { z } from 'zod';

export const createWalletSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['CASH', 'BANK', 'MOBILE_MONEY']),
  provider: z.string().optional(),
  balance: z.string().optional(),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1).optional(),
  provider: z.string().optional(),
});

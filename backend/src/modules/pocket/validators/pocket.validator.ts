import { z } from "zod";

export const transactionSchema = z.object({
  kind: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive("Amount must be greater than 0"),
  occurredAt: z.string().datetime({ message: "Invalid date format" }),
  sourceWalletId: z.string().uuid().optional(),
  destinationWalletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
})
.refine((data) => {
  if (data.kind === 'EXPENSE' && !data.sourceWalletId) return false;
  return true;
}, { message: "Source wallet is required for expenses", path: ["sourceWalletId"] })
.refine((data) => {
  if (data.kind === 'INCOME' && !data.destinationWalletId) return false;
  return true;
}, { message: "Destination wallet is required for income", path: ["destinationWalletId"] })
.refine((data) => {
  if (data.kind === 'TRANSFER') {
    return !!data.sourceWalletId && !!data.destinationWalletId && data.sourceWalletId !== data.destinationWalletId;
  }
  return true;
}, { message: "Transfers require two different wallets", path: ["destinationWalletId"] });


// wallet
export const createWalletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CASH", "BANK", "MOBILE_MONEY"]),
  provider: z.enum(["AIRTEL", "TIGO", "TTCL", "HALOTEL", "NMB", "CRDB", "OTHER"]).optional(),
  balance: z.number().min(0).optional(),
});

export const updateWalletSchema = createWalletSchema.omit({ balance: true });
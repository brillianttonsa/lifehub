import { relations } from "drizzle-orm";

import { wallets } from "./wallets";
import { transactions } from "./transactions";
import { activities } from "./activities";

export const walletRelations = relations(wallets, ({ many }) => ({
  outgoingTransactions: many(transactions, {
    relationName: "sourceWallet",
  }),
  incomingTransactions: many(transactions, {
    relationName: "destinationWallet",
  }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  sourceWallet: one(wallets, {
    fields: [transactions.sourceWalletId],
    references: [wallets.id],
    relationName: "sourceWallet",
  }),
  destinationWallet: one(wallets, {
    fields: [transactions.destinationWalletId],
    references: [wallets.id],
    relationName: "destinationWallet",
  }),
  activity: one(activities, {
    fields: [transactions.activityId],
    references: [activities.id],
  }),
}));

export const activityRelations = relations(activities, ({ many }) => ({
  transactions: many(transactions),
}));
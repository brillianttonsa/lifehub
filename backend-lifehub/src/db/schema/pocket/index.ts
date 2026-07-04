import { relations } from 'drizzle-orm';
import { users } from '../auth/users';
import { activities } from './activities';
import { transactions } from './transactions';
import { wallets } from './wallets';

export * from './wallets';
export * from './activities';
export * from './transactions';

export const pocketUsersRelations = relations(users, ({ many }) => ({
  pocketWallets: many(wallets),
  pocketActivities: many(activities),
  pocketTransactions: many(transactions),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  sourceTransactions: many(transactions, { relationName: 'sourceWallet' }),
  destinationTransactions: many(transactions, {
    relationName: 'destinationWallet',
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  sourceWallet: one(wallets, {
    fields: [transactions.sourceWalletId],
    references: [wallets.id],
    relationName: 'sourceWallet',
  }),
  destinationWallet: one(wallets, {
    fields: [transactions.destinationWalletId],
    references: [wallets.id],
    relationName: 'destinationWallet',
  }),
  activity: one(activities, {
    fields: [transactions.activityId],
    references: [activities.id],
  }),
}));

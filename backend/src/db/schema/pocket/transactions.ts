import {
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/users';
import { activities } from './activities';
import { wallets } from './wallets';

export const transactionTypeEnum = pgEnum('transaction_type', [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
]);

export const transactions = pgTable(
  'pocket_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: transactionTypeEnum('type').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    sourceWalletId: uuid('source_wallet_id').references(() => wallets.id, {
      onDelete: 'restrict',
    }),
    destinationWalletId: uuid('destination_wallet_id').references(
      () => wallets.id,
      { onDelete: 'restrict' },
    ),
    activityId: uuid('activity_id').references(() => activities.id, {
      onDelete: 'set null',
    }),
    description: text('description'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('pocket_transactions_user_idx').on(t.userId, t.occurredAt),
    index('pocket_transactions_source_wallet_idx').on(t.sourceWalletId),
    index('pocket_transactions_destination_wallet_idx').on(t.destinationWalletId),
    index('pocket_transactions_activity_idx').on(t.activityId),
  ],
);

export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];

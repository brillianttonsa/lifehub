import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/users';



export const walletTypeEnum = pgEnum('wallet_type', [
  'CASH',
  'BANK',
  'MOBILE_MONEY',
]);

export const wallets = pgTable(
  'pocket_wallets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 80 }).notNull(),
    type: walletTypeEnum('type').notNull(),
    provider: varchar('provider', { length: 120 }),
    balance: numeric('balance', { precision: 14, scale: 2 }).notNull().default('0'),
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('pocket_wallets_user_idx').on(t.userId),
  ],
);

export type WalletType = (typeof walletTypeEnum.enumValues)[number];

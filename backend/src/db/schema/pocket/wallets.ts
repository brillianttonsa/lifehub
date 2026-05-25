import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from '../auth';

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),

  type: text('type', {
    enum: ['CASH', 'BANK', 'MOBILE_MONEY'],
  }).notNull(),

  provider: text('provider'), // only for BANK / MOBILE_MONEY

  balance: numeric('balance', { precision: 12, scale: 2 })
    .notNull()
    .default('0'),

  isDeleted: boolean('is_deleted').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

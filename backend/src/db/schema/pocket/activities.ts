import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../auth';

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(), // one word

  isDefault: boolean('is_default').default(false), // system-provided

  isDeleted: boolean('is_deleted').default(false),

  createdAt: timestamp('created_at').defaultNow(),

  updatedAt: timestamp('updated_at').defaultNow(),

  deletedAt: timestamp('deleted_at'),
});

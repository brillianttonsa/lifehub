import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  passwordHash: text('password_hash'),

  fullName: varchar('full_name', { length: 150 }).notNull(),

  // OAuth fields
  googleId: varchar('google_id', { length: 255 }).unique(),

  provider: varchar('provider', { length: 50 }).notNull().default('local'), // 'local' | 'google' | 'github' | etc

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

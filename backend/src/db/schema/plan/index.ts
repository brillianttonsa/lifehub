import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  index,
} from 'drizzle-orm/pg-core'
import { users } from '../auth/users'

export const planTimeframeEnum = pgEnum('plan_timeframe', [
  'Yearly',
  'Half-Yearly',
  'Quarterly',
  'Monthly',
  'Weekly',
  'Custom Range',
])

export const planPriorityEnum = pgEnum('plan_priority', ['Low', 'Medium', 'High'])

export const planStatusEnum = pgEnum('plan_status', [
  'Draft',
  'Active',
  'Completed',
  'Archived',
  'Cancelled',
])

export const plans = pgTable(
  'plans',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    timeframe: planTimeframeEnum('timeframe').notNull().default('Monthly'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    priority: planPriorityEnum('priority').notNull().default('Medium'),
    status: planStatusEnum('status').notNull().default('Active'),
    progress: integer('progress').notNull().default(0),
    notes: text('notes').notNull().default(''),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('plans_user_idx').on(t.userId),
    index('plans_timeframe_idx').on(t.timeframe),
    index('plans_status_idx').on(t.status),
    index('plans_priority_idx').on(t.priority),
    index('plans_start_date_idx').on(t.startDate),
    index('plans_end_date_idx').on(t.endDate),
  ],
)

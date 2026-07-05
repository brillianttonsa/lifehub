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

/**
 * ─────────────────────────────────────────────────────────────
 * Planning Cycle
 * A time-based container that groups multiple Goals together
 * (e.g. "Q1 2027", "2027 Goals", "Ramadan Goals").
 * ─────────────────────────────────────────────────────────────
 */

export const cycleTypeEnum = pgEnum('cycle_type', [
  'Yearly',
  'Half-Yearly',
  'Quarterly',
  'Monthly',
  'Weekly',
  'Custom',
])

export const cycleStatusEnum = pgEnum('cycle_status', [
  'Active',
  'Completed',
  'Archived',
])

export const planningCycles = pgTable(
  'planning_cycles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: cycleTypeEnum('type').notNull().default('Monthly'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: cycleStatusEnum('status').notNull().default('Active'),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('planning_cycles_user_idx').on(t.userId),
    index('planning_cycles_type_idx').on(t.type),
    index('planning_cycles_status_idx').on(t.status),
    index('planning_cycles_start_date_idx').on(t.startDate),
    index('planning_cycles_end_date_idx').on(t.endDate),
  ],
)

/**
 * ─────────────────────────────────────────────────────────────
 * Goal
 * An actionable objective that lives inside a Planning Cycle.
 * ─────────────────────────────────────────────────────────────
 */

export const goalPriorityEnum = pgEnum('goal_priority', ['Low', 'Medium', 'High'])

export const goalStatusEnum = pgEnum('goal_status', [
  'Pending',
  'In Progress',
  'Completed',
])

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    planningCycleId: uuid('planning_cycle_id')
      .notNull()
      .references(() => planningCycles.id, { onDelete: 'cascade' }),
    // Denormalized for cheap ownership checks / direct filtering without a join.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    priority: goalPriorityEnum('priority').notNull().default('Medium'),
    status: goalStatusEnum('status').notNull().default('Pending'),
    progress: integer('progress').notNull().default(0),
    notes: text('notes').notNull().default(''),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('goals_planning_cycle_idx').on(t.planningCycleId),
    index('goals_user_idx').on(t.userId),
    index('goals_status_idx').on(t.status),
    index('goals_priority_idx').on(t.priority),
  ],
)

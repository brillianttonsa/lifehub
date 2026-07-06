import {
  pgEnum,
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../auth/users'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const disciplineCycleStatusEnum = pgEnum('discipline_cycle_status', [
  'active',
  'completed',
  'archived',
])

// ---------------------------------------------------------------------------
// Discipline Cycle — a fixed date range the user commits to
// ---------------------------------------------------------------------------

export const disciplineCycles = pgTable(
  'discipline_cycles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: disciplineCycleStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('discipline_cycles_user_idx').on(t.userId),
    index('discipline_cycles_status_idx').on(t.status),
  ],
)

// ---------------------------------------------------------------------------
// Discipline Task — a non-negotiable task tracked every day of the cycle
// ---------------------------------------------------------------------------

export const disciplineTasks = pgTable(
  'discipline_tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => disciplineCycles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('discipline_tasks_cycle_idx').on(t.cycleId)],
)

// ---------------------------------------------------------------------------
// Discipline Log — one done/not-done mark for a task on a given day
// ---------------------------------------------------------------------------

export const disciplineLogs = pgTable(
  'discipline_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id')
      .notNull()
      .references(() => disciplineTasks.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    isDone: boolean('is_done').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('discipline_logs_task_idx').on(t.taskId),
    index('discipline_logs_user_idx').on(t.userId),
    index('discipline_logs_date_idx').on(t.date),
    // One mark per task per day — toggle logic depends on this being unique.
    unique('discipline_logs_task_date_unique').on(t.taskId, t.date),
  ],
)

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const disciplineCyclesRelations = relations(disciplineCycles, ({ many }) => ({
  tasks: many(disciplineTasks),
}))

export const disciplineTasksRelations = relations(disciplineTasks, ({ one, many }) => ({
  cycle: one(disciplineCycles, {
    fields: [disciplineTasks.cycleId],
    references: [disciplineCycles.id],
  }),
  logs: many(disciplineLogs),
}))

export const disciplineLogsRelations = relations(disciplineLogs, ({ one }) => ({
  task: one(disciplineTasks, {
    fields: [disciplineLogs.taskId],
    references: [disciplineTasks.id],
  }),
}))

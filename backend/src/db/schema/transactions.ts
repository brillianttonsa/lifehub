import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { wallets } from "./wallets";
import { activities } from "./activities";

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  type: text("type", {
    enum: ["INCOME", "EXPENSE", "TRANSFER"],
  }).notNull(),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

  activityId: uuid("activity_id")
    .references(() => activities.id, { onDelete: "set null" }),

  description: text("description"),

  sourceWalletId: uuid("source_wallet_id")
    .references(() => wallets.id, { onDelete: "set null" }),

  destinationWalletId: uuid("destination_wallet_id")
    .references(() => wallets.id, { onDelete: "set null" }),

  occurredAt: timestamp("occurred_at").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  name: text("name").notNull(),

  type: text("type", {
    enum: ["CASH", "BANK", "MOBILE_MONEY"],
  }).notNull(),

  provider: text("provider"), // only for BANK / MOBILE_MONEY

  balance: numeric("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
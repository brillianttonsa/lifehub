import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").notNull(),

  name: text("name").notNull(), // one word

  isDefault: boolean("is_default").default(false), // system-provided

  createdAt: timestamp("created_at").defaultNow(),
});
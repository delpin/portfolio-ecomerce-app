import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { relations } from "drizzle-orm";

export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 100 }).notNull(),
  accessToken: varchar("access_token", { length: 1000 }),
  refreshToken: varchar("refresh_token", { length: 1000 }),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
  scope: varchar("scope", { length: 1000 }),
  idToken: varchar("id_token", { length: 2000 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

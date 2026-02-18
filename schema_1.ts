import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Social media account types available for sale
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  /** Account type: TikTok, YouTube, or Instagram */
  type: mysqlEnum("type", ["tiktok", "youtube", "instagram"]).notNull(),
  /** Account/channel name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Account username/handle */
  username: varchar("username", { length: 255 }).notNull(),
  /** Number of followers */
  followers: int("followers").notNull(),
  /** Account age in months */
  ageMonths: int("ageMonths").notNull(),
  /** Price in USD */
  price: int("price").notNull(),
  /** Account description */
  description: text("description"),
  /** Account quality score (0-100) */
  qualityScore: int("qualityScore").default(0),
  /** Average engagement rate */
  engagementRate: varchar("engagementRate", { length: 10 }),
  /** Seller user ID */
  sellerId: int("sellerId").notNull(),
  /** Account status: active, sold, or removed */
  status: mysqlEnum("status", ["active", "sold", "removed"]).default("active"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Purchase transactions
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  /** Account being purchased */
  accountId: int("accountId").notNull(),
  /** Buyer user ID */
  buyerId: int("buyerId").notNull(),
  /** Seller user ID */
  sellerId: int("sellerId").notNull(),
  /** Purchase price */
  price: int("price").notNull(),
  /** Purchase status: pending, completed, or cancelled */
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  /** Purchase timestamp */
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
  /** Completion timestamp */
  completedAt: timestamp("completedAt"),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * User reviews and ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  /** Account being reviewed */
  accountId: int("accountId").notNull(),
  /** Reviewer user ID */
  reviewerId: int("reviewerId").notNull(),
  /** Rating (1-5 stars) */
  rating: int("rating").notNull(),
  /** Review text */
  comment: text("comment"),
  /** Review timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
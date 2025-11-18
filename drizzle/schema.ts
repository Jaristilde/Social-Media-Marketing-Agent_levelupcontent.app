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
 * App profiles - stores information about the user's app/product for content generation
 */
export const appProfiles = mysqlTable("app_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  appName: varchar("app_name", { length: 255 }).notNull(),
  appDescription: text("app_description").notNull(),
  targetAudience: text("target_audience"),
  brandVoice: text("brand_voice"),
  keywords: text("keywords"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AppProfile = typeof appProfiles.$inferSelect;
export type InsertAppProfile = typeof appProfiles.$inferInsert;

/**
 * Social accounts - stores connected Instagram/TikTok account information
 */
export const socialAccounts = mysqlTable("social_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok"]).notNull(),
  accountName: varchar("account_name", { length: 255 }),
  accountId: varchar("account_id", { length: 255 }),
  isConnected: int("is_connected").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

/**
 * Content library - stores AI-generated content
 */
export const contentLibrary = mysqlTable("content_library", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  campaignId: int("campaign_id"),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "both"]).notNull(),
  contentType: mysqlEnum("content_type", ["caption", "hashtags", "idea"]).notNull(),
  content: text("content").notNull(),
  hashtags: text("hashtags"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContentLibrary = typeof contentLibrary.$inferSelect;
export type InsertContentLibrary = typeof contentLibrary.$inferInsert;

/**
 * Campaigns - organizes content into marketing campaigns
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
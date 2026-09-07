import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ReviewInput } from "@/lib/domain";
export const companies = pgTable("companies", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  industry: text().notNull(),
  size: text().notNull(),
  description: text().notNull(),
  website: text().notNull().default(""),
  color: text().notNull().default("#159578"),
  mark: text().notNull().default("S"),
});
export const locations = pgTable("company_locations", {
  id: uuid().defaultRandom().primaryKey(),
  companyId: uuid()
    .notNull()
    .references(() => companies.id),
  city: text().notNull(),
});
export const reviews = pgTable("reviews", {
  id: uuid().defaultRandom().primaryKey(),
  companyId: uuid()
    .notNull()
    .references(() => companies.id),
  userId: uuid().notNull(),
  data: jsonb().$type<ReviewInput>().notNull(),
  status: text().notNull().default("pending"),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const favorites = pgTable(
  "favorites",
  {
    id: uuid().defaultRandom().primaryKey(),
    companyId: uuid()
      .notNull()
      .references(() => companies.id),
    userId: uuid().notNull(),
  },
  (t) => [uniqueIndex("favorite_user_company").on(t.userId, t.companyId)],
);
export const votes = pgTable(
  "review_votes",
  {
    id: uuid().defaultRandom().primaryKey(),
    reviewId: uuid()
      .notNull()
      .references(() => reviews.id),
    userId: uuid().notNull(),
  },
  (t) => [uniqueIndex("vote_user_review").on(t.userId, t.reviewId)],
);
export const comments = pgTable("review_comments", {
  id: uuid().defaultRandom().primaryKey(),
  reviewId: uuid()
    .notNull()
    .references(() => reviews.id),
  userId: uuid().notNull(),
  content: text().notNull(),
  status: text().notNull().default("pending"),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const submissions = pgTable("company_submissions", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().notNull(),
  name: text().notNull(),
  city: text().notNull(),
  website: text().notNull(),
  description: text().notNull(),
  status: text().notNull().default("pending"),
});
export const reports = pgTable("reports", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().notNull(),
  reviewId: uuid()
    .notNull()
    .references(() => reviews.id),
  content: text().notNull(),
  status: text().notNull().default("pending"),
});

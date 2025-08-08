import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricType: text("metric_type").notNull(),
  propertyType: text("property_type").notNull(), // 'sfr', 'mf', 'total'
  value: real("value").notNull(),
  stringValue: text("string_value"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const vacancyDistribution = pgTable("vacancy_distribution", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyType: text("property_type").notNull(),
  daysRange: text("days_range").notNull(),
  count: integer("count").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMetricSchema = createInsertSchema(metrics).omit({
  id: true,
  lastUpdated: true,
});

export const insertVacancyDistributionSchema = createInsertSchema(vacancyDistribution).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type VacancyDistribution = typeof vacancyDistribution.$inferSelect;
export type InsertVacancyDistribution = z.infer<typeof insertVacancyDistributionSchema>;

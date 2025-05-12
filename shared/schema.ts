import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  data: jsonb("data"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  userId: true,
  name: true,
  data: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  event: true,
  data: true,
  userId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

// Character data structure
export const characterDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  secretIdentity: z.string().optional(),
  concept: z.string().optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  appearance: z.string().optional(),
  origin: z.string().optional(),
  archetype: z.string().optional(),
  abilities: z.object({
    strength: z.object({ value: z.number(), modifier: z.number() }),
    dexterity: z.object({ value: z.number(), modifier: z.number() }),
    constitution: z.object({ value: z.number(), modifier: z.number() }),
    intelligence: z.object({ value: z.number(), modifier: z.number() }),
    wisdom: z.object({ value: z.number(), modifier: z.number() }),
    charisma: z.object({ value: z.number(), modifier: z.number() }),
  }),
  skills: z.array(z.object({
    name: z.string(),
    ability: z.string(),
    ranks: z.number(),
    specialization: z.string().optional(),
    trained: z.boolean(),
  })),
  powers: z.array(z.object({
    name: z.string(),
    description: z.string(),
    cost: z.number(),
    rank: z.number(),
    perks: z.array(z.string()),
    flaws: z.array(z.string()),
  })),
  complications: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  gear: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  defense: z.number(),
  toughness: z.number(),
  fortitude: z.number(),
  reflex: z.number(),
  willpower: z.number(),
  initiative: z.number(),
  pointsSpent: z.object({
    abilities: z.number(),
    skills: z.number(),
    powers: z.number(),
    total: z.number(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CharacterData = z.infer<typeof characterDataSchema>;

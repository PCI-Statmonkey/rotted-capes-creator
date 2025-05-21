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

// Game content tables for admin editing
export const origins = pgTable("origins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  abilityBonuses: jsonb("ability_bonuses").notNull(),
  specialAbility: text("special_ability"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  originFeatures: jsonb("origin_features").default([]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const archetypes = pgTable("archetypes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  keyAbilities: jsonb("key_abilities").notNull(), // Array of ability names
  specialAbility: text("special_ability").notNull(),
  trainedSkill: text("trained_skill").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  ability: text("ability").notNull(), // Which ability it's tied to (e.g., "Strength")
  description: text("description").notNull(),
  untrained: boolean("untrained").default(true).notNull(), // Can it be used untrained?
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feats = pgTable("feats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  prerequisites: jsonb("prerequisites"), // Optional prerequisites
  benefits: text("benefits").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skillSets = pgTable("skill_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  points: integer("points").notNull(),
  skills: jsonb("skills").notNull(), // Array of skill objects with names and focuses
  feats: jsonb("feats").notNull(), // Array of feat names
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const powers = pgTable("powers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  hasDamageType: boolean("has_damage_type").default(false).notNull(),
  hasTarget: boolean("has_target").default(false).notNull(),
  skillCompatible: boolean("skill_compatible").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const powerSets = pgTable("power_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  powers: jsonb("powers").notNull(), // Array of power objects with names and scores
  requiredArchetypes: jsonb("required_archetypes"), // Optional array of archetype names
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const powerModifiers = pgTable("power_modifiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  bonus: integer("bonus").notNull(), // Positive for flaws, negative for perks
  type: text("type").notNull(), // Either "flaw" or "perk"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertOriginSchema = createInsertSchema(origins).pick({
  name: true,
  description: true,
  abilityBonuses: true,
  specialAbility: true,
  imageUrl: true,
  originFeatures: true,
});

export const insertArchetypeSchema = createInsertSchema(archetypes).pick({
  name: true,
  description: true,
  keyAbilities: true,
  specialAbility: true,
  trainedSkill: true,
  imageUrl: true,
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  name: true,
  ability: true,
  description: true,
  untrained: true,
});

export const insertFeatSchema = createInsertSchema(feats).pick({
  name: true,
  description: true,
  prerequisites: true,
  benefits: true,
});

export const insertSkillSetSchema = createInsertSchema(skillSets).pick({
  name: true,
  points: true,
  skills: true,
  feats: true,
  description: true,
});

export const insertPowerSchema = createInsertSchema(powers).pick({
  name: true,
  description: true,
  hasDamageType: true,
  hasTarget: true,
  skillCompatible: true,
});

export const insertPowerSetSchema = createInsertSchema(powerSets).pick({
  name: true,
  powers: true,
  requiredArchetypes: true,
});

export const insertPowerModifierSchema = createInsertSchema(powerModifiers).pick({
  name: true,
  description: true,
  bonus: true,
  type: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertOrigin = z.infer<typeof insertOriginSchema>;
export type Origin = typeof origins.$inferSelect;

export type InsertArchetype = z.infer<typeof insertArchetypeSchema>;
export type Archetype = typeof archetypes.$inferSelect;

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

export type InsertFeat = z.infer<typeof insertFeatSchema>;
export type Feat = typeof feats.$inferSelect;

export type InsertSkillSet = z.infer<typeof insertSkillSetSchema>;
export type SkillSet = typeof skillSets.$inferSelect;

export type InsertPower = z.infer<typeof insertPowerSchema>;
export type Power = typeof powers.$inferSelect;

export type InsertPowerSet = z.infer<typeof insertPowerSetSchema>;
export type PowerSet = typeof powerSets.$inferSelect;

export type InsertPowerModifier = z.infer<typeof insertPowerModifierSchema>;
export type PowerModifier = typeof powerModifiers.$inferSelect;

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

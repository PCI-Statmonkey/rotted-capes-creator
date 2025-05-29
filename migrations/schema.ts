// shared/schema.ts

import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

// Origins Table
export const origins = pgTable("origins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  abilityBonuses: jsonb("ability_bonuses").notNull(), // New: required field
  uniqueAdvantages: jsonb("unique_advantages"),
  uniqueDisadvantages: jsonb("unique_disadvantages"),
  originFeatures: jsonb("origin_features"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Archetypes Table
export const archetypes = pgTable("archetypes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  abilityBonuses: jsonb("ability_bonuses").notNull(),
  typicalPowers: jsonb("typical_powers").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Skills Table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categories: jsonb("categories").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feats Table
export const feats = pgTable("feats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prerequisites: jsonb("prerequisites"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Skill Sets Table
export const skillSets = pgTable("skill_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  includedSkills: jsonb("included_skills").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Powers Table
export const powers = pgTable("powers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  powerType: text("power_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Power Sets Table
export const powerSets = pgTable("power_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  includedPowers: jsonb("included_powers").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Power Modifiers Table
export const powerModifiers = pgTable("power_modifiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  modifierType: text("modifier_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

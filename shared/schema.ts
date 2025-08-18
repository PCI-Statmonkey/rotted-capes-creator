import { pgTable, text, serial, integer, boolean, json, jsonb, timestamp } from "drizzle-orm/pg-core";
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
})
// Origins table
export const origins = pgTable("origins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  special_ability: text("special_ability"),
  image_url: text("image_url"),
  ability_bonuses: json("ability_bonuses").notNull(),
  origin_features: json("origin_features"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
// Archetypes table
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
export const feats = pgTable("feats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prerequisites: jsonb("prerequisites"),
  type: text("type").notNull(),
  // ADD THE FOLLOWING LINES:
  repeatable: boolean("repeatable").notNull().default(false),
  tags: text("tags").array().notNull().default([]),
  notes: text("notes").notNull().default(""),
  input_label: text("input_label"),
});

export const skillSets = pgTable("skill_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  /**
   * Older versions of the database expect a few additional columns on the
   * `skill_sets` table. The seed script interacts with production data that may
   * still include these columns, so we model them here with sensible defaults
   * to satisfy the NOT NULL constraints and keep the schema in sync.
   */
  points: integer("points").notNull().default(0),
  skills: jsonb("skills").notNull().default([]),
  feats: jsonb("feats").notNull().default([]),
  edges: text("edges").array().notNull().default([]),
  deepCutTrigger: text("deep_cut_trigger"),
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
  burnout: text("burnout"),
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

export const weaknesses = pgTable("weaknesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  baseCost: integer("base_cost").default(0).notNull(),
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
  ability_bonuses: true,
  special_ability: true,
  image_url: true,
  origin_features: true,
});

export const insertArchetypeSchema = createInsertSchema(archetypes).pick({
  name: true,
  description: true,
  keyAbilities: true,
  specialAbility: true,
  trainedSkill: true,
  imageUrl: true,
});

export const insertSkillSetSchema = createInsertSchema(skillSets).pick({
  name: true,
  description: true,
  points: true,
  skills: true,
  feats: true,
  edges: true,
  deepCutTrigger: true,
});

export const insertPowerSchema = createInsertSchema(powers).pick({
  name: true,
  description: true,
  hasDamageType: true,
  hasTarget: true,
  skillCompatible: true,
  burnout: true,
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

export const insertWeaknessSchema = createInsertSchema(weaknesses).pick({
  name: true,
  description: true,
  baseCost: true,
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

export type InsertWeakness = z.infer<typeof insertWeaknessSchema>;
export type Weakness = typeof weaknesses.$inferSelect;

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
  rank: z.number(),
  level: z.number(),
  rankBonus: z.number(),
  grit: z.number(),
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
    ap: z.number().optional(),
    starting: z.boolean().optional(),
    batteryPowered: z.boolean().optional(),
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
// Maneuvers table
export const maneuvers = pgTable("maneuvers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(),
  requirements: jsonb("requirements").notNull().default([]),
  attack: text("attack").notNull(),
  action: text("action").notNull(),
  range: text("range").notNull(),
  effect: text("effect").notNull(),
  special: text("special"),
  weapons: text("weapons"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Origin features table
export const originFeatures = pgTable("origin_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  effectType: text("effect_type").default("story").notNull(), // "mechanical", "story", etc.
  effect: text("effect").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Gear table
export const gear = pgTable("gear", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),  // e.g., "Weapon", "Armor", "Equipment"
  ap: integer("ap").notNull(),           // Action Point cost
  tags: jsonb("tags").default([]),       // Optional: e.g., ["firearm", "2H"]
  batteryPowered: boolean("battery_powered").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Character-related tables for normalized data
export const characterFeats = pgTable("character_feats", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  featId: integer("feat_id").references(() => feats.id),
  name: text("name").notNull(),
  source: text("source"),
  skillSetName: text("skill_set_name"),
});

export const characterPowers = pgTable("character_powers", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  powerId: integer("power_id").references(() => powers.id),
  name: text("name").notNull(),
  description: text("description"),
  cost: integer("cost"),
  rank: integer("rank"),
  perks: jsonb("perks").default([]).notNull(),
  flaws: jsonb("flaws").default([]).notNull(),
});

export const characterSkills = pgTable("character_skills", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  skillSetId: integer("skill_set_id").references(() => skillSets.id),
  name: text("name").notNull(),
  ability: text("ability").notNull(),
  ranks: integer("ranks").notNull(),
  specialization: text("specialization"),
  trained: boolean("trained").default(true).notNull(),
});

export const characterGear = pgTable("character_gear", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  gearId: integer("gear_id").references(() => gear.id),
  name: text("name").notNull(),
  description: text("description"),
});

export const characterComplications = pgTable("character_complications", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const insertManeuverSchema = createInsertSchema(maneuvers);

export const maneuverSchema = insertManeuverSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

  export const insertOriginFeatureSchema = createInsertSchema(originFeatures).pick({
  name: true,
  description: true,
  effectType: true,
  effect: true,
});

export const insertGearSchema = createInsertSchema(gear).pick({
  name: true,
  description: true,
  category: true,
  ap: true,
  tags: true,
  batteryPowered: true,
});
export const insertFeatSchema = createInsertSchema(feats).pick({
  name: true,
  description: true,
  prerequisites: true,
  type: true,
  repeatable: true,
  tags: true,
  notes: true,
  input_label: true,
});

export const insertCharacterFeatSchema = createInsertSchema(characterFeats).pick({
  characterId: true,
  featId: true,
  name: true,
  source: true,
  skillSetName: true,
});

export const insertCharacterPowerSchema = createInsertSchema(characterPowers).pick({
  characterId: true,
  powerId: true,
  name: true,
  description: true,
  cost: true,
  rank: true,
  perks: true,
  flaws: true,
});

export const insertCharacterSkillSchema = createInsertSchema(characterSkills).pick({
  characterId: true,
  name: true,
  ability: true,
  ranks: true,
  specialization: true,
  trained: true,
});

export const insertCharacterGearSchema = createInsertSchema(characterGear).pick({
  characterId: true,
  gearId: true,
  name: true,
  description: true,
});

export const insertCharacterComplicationSchema = createInsertSchema(characterComplications).pick({
  characterId: true,
  name: true,
  description: true,
});

export type Maneuver = z.infer<typeof maneuverSchema>;
export type NewManeuver = z.infer<typeof insertManeuverSchema>;
export type CharacterData = z.infer<typeof characterDataSchema>;
export type NewFeat = typeof feats.$inferInsert;

export type CharacterFeat = typeof characterFeats.$inferSelect;
export type NewCharacterFeat = typeof characterFeats.$inferInsert;

export type CharacterPower = typeof characterPowers.$inferSelect;
export type NewCharacterPower = typeof characterPowers.$inferInsert;

export type CharacterSkill = typeof characterSkills.$inferSelect;
export type NewCharacterSkill = typeof characterSkills.$inferInsert;

export type CharacterGearItem = typeof characterGear.$inferSelect;
export type NewCharacterGearItem = typeof characterGear.$inferInsert;

export type CharacterComplication = typeof characterComplications.$inferSelect;
export type NewCharacterComplication = typeof characterComplications.$inferInsert;

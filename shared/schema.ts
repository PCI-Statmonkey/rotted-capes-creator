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

// ============================================================================
// THREAT BUILDER TYPES - Complete Overhaul According to Specification
// ============================================================================

// Core Enums and Constants
export const ActionType = {
  ATTACK: "Attack" as const,
  NON_ATTACK: "Non-Attack" as const,
} as const;

export const AttackFamily = {
  MELEE: "Melee" as const,
  RANGED: "Ranged" as const,
  MENTAL: "Mental" as const,
  ELEMENTAL: "Elemental" as const,
  ENERGY: "Energy" as const,
  SPECIAL: "Special" as const,
} as const;

export const DefenseType = {
  AVOIDANCE: "Avoidance" as const,
  FORTITUDE: "Fortitude" as const,
  WILLPOWER: "Willpower" as const,
} as const;

export const ThreatRank = {
  BYSTANDER: "Bystander" as const,
  HARDENED: "Hardened" as const,
  ZETA: "Zeta" as const,
  EPSILON: "Epsilon" as const,
  DELTA: "Delta" as const,
  GAMMA: "Gamma" as const,
  BETA: "Beta" as const,
  ALPHA: "Alpha" as const,
  THETA: "Theta" as const,
  SIGMA: "Sigma" as const,
  UPSILON: "Upsilon" as const,
  OMEGA: "Omega" as const,
} as const;

export const ThreatRole = {
  SKILLFUL: "Skillful" as const,
  STRIKER: "Striker" as const,
  BRUISER: "Bruiser" as const,
  RANGED: "Ranged" as const,
  CONTROLLER: "Controller" as const,
  LURKER: "Lurker" as const,
  HORDE_LEADER: "Horde Leader" as const,
} as const;

export const ThreatSize = {
  TINY: "Tiny/Smaller" as const,
  SMALL: "Small" as const,
  MEDIUM: "Medium" as const,
  LARGE: "Large" as const,
  HUGE: "Huge" as const,
  GARGANTUAN: "Gargantuan" as const,
} as const;

export const ThreatType = {
  ANIMAL: "Animal" as const,
  SURVIVOR: "Survivor" as const,
  ABOMINATION: "Abomination" as const,
  POWERED_INDIVIDUAL: "Powered Individual" as const,
  ROBOT_TECH: "Robot/Tech" as const,
  ZOMBIE: "Zombie" as const,
  SUPER_Z: "Super Z" as const,
} as const;

// Type aliases for the const objects
export type ActionTypeValue = typeof ActionType[keyof typeof ActionType];
export type AttackFamilyValue = typeof AttackFamily[keyof typeof AttackFamily];
export type DefenseTypeValue = typeof DefenseType[keyof typeof DefenseType];
export type ThreatRankValue = typeof ThreatRank[keyof typeof ThreatRank];
export type ThreatRoleValue = typeof ThreatRole[keyof typeof ThreatRole];
export type ThreatSizeValue = typeof ThreatSize[keyof typeof ThreatSize];
export type ThreatTypeValue = typeof ThreatType[keyof typeof ThreatType];

// Core interfaces for Threat Builder system
export interface ThreatAbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface ThreatDefenses {
  avoidance: number;
  fortitude: number;
  willpower: number;
}

export interface ThreatAction {
  id: string;
  name: string;
  type: ActionTypeValue;
  attackFamily?: AttackFamilyValue; // Only for Attack actions
  description: string;
  toHit?: number; // Only for Attack actions
  damage?: string; // Only for Attack actions (e.g., "2d6+3")
  defense?: DefenseTypeValue; // Target defense for Attack actions
  range?: string; // e.g., "Melee", "50 feet", "Close"
  area?: string; // e.g., "Single Target", "10-foot radius"
  duration?: string; // e.g., "Instant", "1 round", "Concentration"
  frequency?: string; // e.g., "At will", "3/day", "1/encounter"
  effects?: string; // Additional effects or conditions
  notes?: string; // GM notes or special rules
  autoGenerated?: boolean; // True if generated by autofill system
  source?: string; // Source of the action (e.g., "Role", "Type", "Custom")
}

export interface ThreatFeature {
  id: string;
  name: string;
  description: string;
  type: "trait" | "immunity" | "Damage Resistance" | "vulnerability" | "special";
  source?: string; // Source of the feature (e.g., "Type", "Role", "Custom")
  autoGenerated?: boolean;
}

export interface ThreatSkill {
  id: string; // Frontend uses string IDs, DB uses number
  name: string;
  bonus: number;
  ability: keyof ThreatAbilityScores;
  description?: string;
}

// Main Threat interface for the new 9-step system
export interface ComprehensiveThreat {
  // Step 1: Basic Information
  id?: string;
  name: string;
  description?: string;
  
  // Step 2: Threat Parameters
  rank: ThreatRankValue;
  role: ThreatRoleValue;
  size: ThreatSizeValue;
  type: ThreatTypeValue;
  advanced: boolean;
  
  // Advanced parameters (when advanced = true)
  defenseRank?: ThreatRankValue;
  durabilityRank?: ThreatRankValue;
  attackRank?: ThreatRankValue;
  effectiveRank?: number;
  
  // Step 3: Ability Scores
  abilityScores: ThreatAbilityScores;
  
  // Step 4: Defenses
  defenses: ThreatDefenses;
  
  // Step 5: Health and Initiative
  stamina: number;
  wounds: number;
  initiative: number;
  pace: string;
  
  // Step 6: Skills
  skills: ThreatSkill[];
  
  // Step 7: Actions
  actions: ThreatAction[];
  
  // Step 8: Features and Traits
  features: ThreatFeature[];
  
  // Step 9: Final Review and Notes
  gmNotes?: string;
  publicNotes?: string;
  tags?: string[];
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  version?: number;
  
  // Auto-generated content tracking (optional - derived from child tables)
  autoFeatures?: string[]; // IDs of auto-generated features
  autoActions?: string[]; // IDs of auto-generated actions
}

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
// Attacks table
export const attacks = pgTable("attacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  bonus: integer("bonus").notNull(),
  range: text("range").notNull(),
  damage: text("damage").notNull(),
  damageType: text("damage_type").notNull(),
  ammoType: text("ammo_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertAttackSchema = createInsertSchema(attacks);

export const attackSchema = insertAttackSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
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

export type Attack = z.infer<typeof attackSchema>;
export type NewAttack = z.infer<typeof insertAttackSchema>;
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

// ============================================================================
// THREAT TABLES - New Comprehensive Schema
// ============================================================================

// Main threats table
export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Threat Parameters
  rank: text("rank").notNull(),
  role: text("role").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  advanced: boolean("advanced").default(false).notNull(),
  
  // Advanced parameters
  defenseRank: text("defense_rank"),
  durabilityRank: text("durability_rank"),
  attackRank: text("attack_rank"),
  effectiveRank: integer("effective_rank"),
  
  // Ability Scores
  strength: integer("strength").default(10).notNull(),
  dexterity: integer("dexterity").default(10).notNull(),
  constitution: integer("constitution").default(10).notNull(),
  intelligence: integer("intelligence").default(10).notNull(),
  wisdom: integer("wisdom").default(10).notNull(),
  charisma: integer("charisma").default(10).notNull(),
  
  // Defenses
  avoidance: integer("avoidance").notNull(),
  fortitude: integer("fortitude").notNull(),
  willpower: integer("willpower").notNull(),
  
  // Health and Initiative
  stamina: integer("stamina").notNull(),
  wounds: integer("wounds").notNull(),
  initiative: integer("initiative").notNull(),
  pace: text("pace").notNull(),
  
  // Notes and metadata
  gmNotes: text("gm_notes"),
  publicNotes: text("public_notes"),
  tags: text("tags").array().default([]),
  
  // Note: Auto-generated content is tracked via autoGenerated flags in child tables
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  version: integer("version").default(1).notNull(),
});

// Threat actions table
export const threatActions = pgTable("threat_actions", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id")
    .references(() => threats.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "Attack" or "Non-Attack"
  attackFamily: text("attack_family"), // Only for Attack actions
  description: text("description").notNull(),
  
  // Attack-specific fields
  toHit: integer("to_hit"),
  damage: text("damage"),
  defense: text("defense"), // Target defense
  
  // Action properties
  range: text("range"),
  area: text("area"),
  duration: text("duration"),
  frequency: text("frequency"),
  effects: text("effects"),
  notes: text("notes"),
  
  // Metadata
  autoGenerated: boolean("auto_generated").default(false).notNull(),
  source: text("source"), // Source of the action
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Threat features table
export const threatFeatures = pgTable("threat_features", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id")
    .references(() => threats.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "trait", "immunity", "resistance", "vulnerability", "special"
  source: text("source"),
  autoGenerated: boolean("auto_generated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Threat skills table
export const threatSkills = pgTable("threat_skills", {
  id: serial("id").primaryKey(),
  threatId: integer("threat_id")
    .references(() => threats.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  bonus: integer("bonus").notNull(),
  ability: text("ability").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// THREAT INSERT SCHEMAS
// ============================================================================

export const insertThreatSchema = createInsertSchema(threats).pick({
  userId: true,
  name: true,
  description: true,
  rank: true,
  role: true,
  size: true,
  type: true,
  advanced: true,
  defenseRank: true,
  durabilityRank: true,
  attackRank: true,
  effectiveRank: true,
  strength: true,
  dexterity: true,
  constitution: true,
  intelligence: true,
  wisdom: true,
  charisma: true,
  avoidance: true,
  fortitude: true,
  willpower: true,
  stamina: true,
  wounds: true,
  initiative: true,
  pace: true,
  gmNotes: true,
  publicNotes: true,
  tags: true,
}).extend({
  // Override with strict enum validation
  rank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]),
  role: z.enum(["Skillful", "Striker", "Bruiser", "Ranged", "Controller", "Lurker", "Horde Leader"]),
  size: z.enum(["Tiny/Smaller", "Small", "Medium", "Large", "Huge", "Gargantuan"]),
  type: z.enum(["Animal", "Survivor", "Abomination", "Powered Individual", "Robot/Tech", "Zombie", "Super Z"]),
  defenseRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
  durabilityRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
  attackRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
});

export const insertThreatActionSchema = createInsertSchema(threatActions).pick({
  threatId: true,
  name: true,
  type: true,
  attackFamily: true,
  description: true,
  toHit: true,
  damage: true,
  defense: true,
  range: true,
  area: true,
  duration: true,
  frequency: true,
  effects: true,
  notes: true,
  autoGenerated: true,
  source: true,
}).extend({
  // Override with strict enum validation
  type: z.enum(["Attack", "Non-Attack"]),
  attackFamily: z.enum(["Melee", "Ranged", "Mental", "Elemental", "Energy", "Special"]).optional(),
  defense: z.enum(["Avoidance", "Fortitude", "Willpower"]).optional(),
});

export const insertThreatFeatureSchema = createInsertSchema(threatFeatures).pick({
  threatId: true,
  name: true,
  description: true,
  type: true,
  source: true,
  autoGenerated: true,
}).extend({
  // Override with strict enum validation
  type: z.enum(["trait", "immunity", "resistance", "vulnerability", "special"]),
});

export const insertThreatSkillSchema = createInsertSchema(threatSkills).pick({
  threatId: true,
  name: true,
  bonus: true,
  ability: true,
  description: true,
}).extend({
  // Override with strict enum validation
  ability: z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]),
});

// ============================================================================
// THREAT TYPES
// ============================================================================

export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type ThreatDB = typeof threats.$inferSelect;

export type InsertThreatAction = z.infer<typeof insertThreatActionSchema>;
export type ThreatActionDB = typeof threatActions.$inferSelect;

export type InsertThreatFeature = z.infer<typeof insertThreatFeatureSchema>;
export type ThreatFeatureDB = typeof threatFeatures.$inferSelect;

export type InsertThreatSkill = z.infer<typeof insertThreatSkillSchema>;
export type ThreatSkillDB = typeof threatSkills.$inferSelect;

// Zod schemas for frontend validation
export const threatActionSchema = z.object({
  id: z.string(), // Frontend uses string IDs, DB uses numbers
  name: z.string().min(1, "Action name is required"),
  type: z.enum(["Attack", "Non-Attack"]),
  attackFamily: z.enum(["Melee", "Ranged", "Mental", "Elemental", "Energy", "Special"]).optional(),
  description: z.string().min(1, "Description is required"),
  toHit: z.number().optional(),
  damage: z.string().optional(),
  defense: z.enum(["Avoidance", "Fortitude", "Willpower"]).optional(),
  range: z.string().optional(),
  area: z.string().optional(),
  duration: z.string().optional(),
  frequency: z.string().optional(),
  effects: z.string().optional(),
  notes: z.string().optional(),
  autoGenerated: z.boolean().default(false),
  source: z.string().optional(),
});

export const threatFeatureSchema = z.object({
  id: z.string(), // Frontend uses string IDs, DB uses numbers
  name: z.string().min(1, "Feature name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["trait", "immunity", "resistance", "vulnerability", "special"]),
  source: z.string().optional(),
  autoGenerated: z.boolean().default(false),
});

export const threatSkillSchema = z.object({
  id: z.string(), // Frontend uses string IDs, DB uses numbers
  name: z.string().min(1, "Skill name is required"),
  bonus: z.number(),
  ability: z.enum(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]),
  description: z.string().optional(),
});

export const comprehensiveThreatSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Threat name is required"),
  description: z.string().optional(),
  
  // Threat Parameters
  rank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]),
  role: z.enum(["Skillful", "Striker", "Bruiser", "Ranged", "Controller", "Lurker", "Horde Leader"]),
  size: z.enum(["Tiny/Smaller", "Small", "Medium", "Large", "Huge", "Gargantuan"]),
  type: z.enum(["Animal", "Survivor", "Abomination", "Powered Individual", "Robot/Tech", "Zombie", "Super Z"]),
  advanced: z.boolean().default(false),
  
  // Advanced parameters
  defenseRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
  durabilityRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
  attackRank: z.enum(["Bystander", "Hardened", "Zeta", "Epsilon", "Delta", "Gamma", "Beta", "Alpha", "Theta", "Sigma", "Upsilon", "Omega"]).optional(),
  effectiveRank: z.number().optional(),
  
  // Ability Scores
  abilityScores: z.object({
    strength: z.number().min(1).max(50),
    dexterity: z.number().min(1).max(50),
    constitution: z.number().min(1).max(50),
    intelligence: z.number().min(1).max(50),
    wisdom: z.number().min(1).max(50),
    charisma: z.number().min(1).max(50),
  }),
  
  // Defenses
  defenses: z.object({
    avoidance: z.number().min(1),
    fortitude: z.number().min(1),
    willpower: z.number().min(1),
  }),
  
  // Health and Initiative
  stamina: z.number().min(1),
  wounds: z.number().min(1),
  initiative: z.number(),
  pace: z.string().min(1),
  
  // Skills, Actions, Features
  skills: z.array(threatSkillSchema).default([]),
  actions: z.array(threatActionSchema).default([]),
  features: z.array(threatFeatureSchema).default([]),
  
  // Notes and metadata
  gmNotes: z.string().optional(),
  publicNotes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Auto-generated content tracking (optional - derived from child tables)
  autoFeatures: z.array(z.string()).default([]).optional(),
  autoActions: z.array(z.string()).default([]).optional(),
  
  // Metadata
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
  version: z.number().default(1),
});

// Type aliases for the comprehensive threat system
export type ComprehensiveThreatInput = z.infer<typeof comprehensiveThreatSchema>;
export type ThreatActionInput = z.infer<typeof threatActionSchema>;
export type ThreatFeatureInput = z.infer<typeof threatFeatureSchema>;
export type ThreatSkillInput = z.infer<typeof threatSkillSchema>;

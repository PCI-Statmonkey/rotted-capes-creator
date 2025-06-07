// server/controllers/gameContentController.ts


import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import {
  insertOriginSchema, insertArchetypeSchema, insertSkillSchema,
  insertFeatSchema, insertSkillSetSchema, insertPowerSchema,
  insertPowerSetSchema, insertPowerModifierSchema,
  insertOriginFeatureSchema, insertGearSchema
} from "@shared/schema";
import { z } from "zod";
import { maneuvers } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

console.log("✅ Loaded gameContentController.ts");

// TypeScript session extension
declare module 'express-session' {
  export interface SessionData {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    };
  }
}

// Middleware to verify admin (disabled for development)
export function verifyAdmin(_req: Request, _res: Response, next: NextFunction) {
  console.log("⚠️ Admin check bypassed (development mode)");
  return next();
}

// Helper to handle validation errors
function handleValidationError(res: Response, result: z.SafeParseReturnType<any, any>): boolean {
  if (!result.success) {
    res.status(400).json({
      error: "Validation error",
      details: result.error.errors
    });
    return true;
  }
  return false;
}

// Helper to generate standard CRUD endpoints for an entity
function makeCrudHandlers<T>(entityName: string, schema: z.ZodTypeAny) {
  return {
    getAll: async (_req: Request, res: Response) => {
      try {
        const result = await storage[`getAll${entityName}`]() as T[];
        res.json(result);
      } catch (err) {
        console.error(`Error fetching ${entityName}s:`, err);
        res.status(500).json({ error: `Failed to fetch ${entityName.toLowerCase()}s` });
      }
    },
    getOne: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });
        const item = await storage[`get${entityName}ById`](id) as T | undefined;
        if (!item) return res.status(404).json({ error: `${entityName} not found` });
        res.json(item);
      } catch (err) {
        console.error(`Error fetching ${entityName}:`, err);
        res.status(500).json({ error: `Failed to fetch ${entityName.toLowerCase()}` });
      }
    },
    create: async (req: Request, res: Response) => {
      const validationResult = schema.safeParse(req.body);
      if (handleValidationError(res, validationResult)) return;
      try {
        const item = await storage[`create${entityName}`](validationResult.data) as T;
        res.status(201).json(item);
      } catch (err) {
        console.error(`Error creating ${entityName}:`, err);
        res.status(500).json({ error: `Failed to create ${entityName.toLowerCase()}` });
      }
    },
    update: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });
        const validationResult = schema.partial().safeParse(req.body);
        if (handleValidationError(res, validationResult)) return;
        const updated = await storage[`update${entityName}`](id, validationResult.data) as T | null;
        if (!updated) return res.status(404).json({ error: `${entityName} not found` });
        res.json(updated);
      } catch (err) {
        console.error(`Error updating ${entityName}:`, err);
        res.status(500).json({ error: `Failed to update ${entityName.toLowerCase()}` });
      }
    },
    remove: async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID format" });
        const existing = await storage[`get${entityName}ById`](id) as T | undefined;
        if (!existing) return res.status(404).json({ error: `${entityName} not found` });
        await storage[`delete${entityName}`](id);
        res.status(204).send();
      } catch (err) {
        console.error(`Error deleting ${entityName}:`, err);
        res.status(500).json({ error: `Failed to delete ${entityName.toLowerCase()}` });
      }
    },
  };
}

// Origin
export const {
  getAll: getAllOrigins,
  getOne: getOriginById,
  create: createOrigin,
  update: updateOrigin,
  remove: deleteOrigin
} = makeCrudHandlers("Origin", insertOriginSchema);

// Archetype
export const {
  getAll: getAllArchetypes,
  getOne: getArchetypeById,
  create: createArchetype,
  update: updateArchetype,
  remove: deleteArchetype
} = makeCrudHandlers("Archetype", insertArchetypeSchema);

// Skill
export const {
  getAll: getAllSkills,
  getOne: getSkillById,
  create: createSkill,
  update: updateSkill,
  remove: deleteSkill
} = makeCrudHandlers("Skill", insertSkillSchema);

// Feat
export const {
  getAll: getAllFeats,
  getOne: getFeatById,
  create: createFeat,
  update: updateFeat,
  remove: deleteFeat
} = makeCrudHandlers("Feat", insertFeatSchema);

// SkillSet
export const {
  getAll: getAllSkillSets,
  getOne: getSkillSetById,
  create: createSkillSet,
  update: updateSkillSet,
  remove: deleteSkillSet
} = makeCrudHandlers("SkillSet", insertSkillSetSchema);

// Power
export const {
  getAll: getAllPowers,
  getOne: getPowerById,
  create: createPower,
  update: updatePower,
  remove: deletePower
} = makeCrudHandlers("Power", insertPowerSchema);

// PowerSet
export const {
  getAll: getAllPowerSets,
  getOne: getPowerSetById,
  create: createPowerSet,
  update: updatePowerSet,
  remove: deletePowerSet
} = makeCrudHandlers("PowerSet", insertPowerSetSchema);

// PowerModifier
export const {
  getAll: getAllPowerModifiers,
  getOne: getPowerModifierById,
  create: createPowerModifier,
  update: updatePowerModifier,
  remove: deletePowerModifier
} = makeCrudHandlers("PowerModifier", insertPowerModifierSchema);

// OriginFeature
export const {
  getAll: getAllOriginFeatures,
  getOne: getOriginFeatureById,
  create: createOriginFeature,
  update: updateOriginFeature,
  remove: deleteOriginFeature
} = makeCrudHandlers("OriginFeature", insertOriginFeatureSchema);

// Gear
export const {
  getAll: getAllGears,
  getOne: getGearById,
  create: createGear,
  update: updateGear,
  remove: deleteGear
} = makeCrudHandlers("Gear", insertGearSchema);

// Get all maneuvers
export async function getAllManeuvers(req, res) {
  const result = await db.select().from(maneuvers);
  res.json(result);
}

// Create a new maneuver
export async function createManeuver(req, res) {
  const { name, type, requirements } = req.body;
  const result = await db.insert(maneuvers).values({ name, type, requirements }).returning();
  res.status(201).json(result[0]);
}

// Update an existing maneuver
export async function updateManeuver(req, res) {
  const id = parseInt(req.params.id);
  const { name, type, requirements } = req.body;
  const result = await db.update(maneuvers).set({ name, type, requirements }).where(eq(maneuvers.id, id)).returning();
  res.json(result[0]);
}

// Delete a maneuver
export async function deleteManeuver(req, res) {
  const id = parseInt(req.params.id);
  await db.delete(maneuvers).where(eq(maneuvers.id, id));
  res.status(204).send();
}

// server/controllers/gameContentController.ts

console.log("🔥🔥🔥 THIS IS THE REAL gameContentController.ts IN USE 🔥🔥🔥");

import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import {
  insertOriginSchema, insertArchetypeSchema, insertSkillSchema,
  insertFeatSchema, insertSkillSetSchema, insertPowerSchema,
  insertPowerSetSchema, insertPowerModifierSchema
} from "@shared/schema";
import { z } from "zod";
import { checkConnection, getConnectionStatus } from "../db";

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

// Export CRUD handlers for each entity
export const {
  getAll: getAllOrigins,
  getOne: getOriginById,
  create: createOrigin,
  update: updateOrigin,
  remove: deleteOrigin
} = makeCrudHandlers("Origin", insertOriginSchema);

export const {
  getAll: getAllArchetypes,
  getOne: getArchetypeById,
  create: createArchetype,
  update: updateArchetype,
  remove: deleteArchetype
} = makeCrudHandlers("Archetype", insertArchetypeSchema);

export const {
  getAll: getAllSkills,
  getOne: getSkillById,
  create: createSkill,
  update: updateSkill,
  remove: deleteSkill
} = makeCrudHandlers("Skill", insertSkillSchema);

export const {
  getAll: getAllFeats,
  getOne: getFeatById,
  create: createFeat,
  update: updateFeat,
  remove: deleteFeat
} = makeCrudHandlers("Feat", insertFeatSchema);

export const {
  getAll: getAllSkillSets,
  getOne: getSkillSetById,
  create: createSkillSet,
  update: updateSkillSet,
  remove: deleteSkillSet
} = makeCrudHandlers("SkillSet", insertSkillSetSchema);

export const {
  getAll: getAllPowers,
  getOne: getPowerById,
  create: createPower,
  update: updatePower,
  remove: deletePower
} = makeCrudHandlers("Power", insertPowerSchema);

export const {
  getAll: getAllPowerSets,
  getOne: getPowerSetById,
  create: createPowerSet,
  update: updatePowerSet,
  remove: deletePowerSet
} = makeCrudHandlers("PowerSet", insertPowerSetSchema);

export const {
  getAll: getAllPowerModifiers,
  getOne: getPowerModifierById,
  create: createPowerModifier,
  update: updatePowerModifier,
  remove: deletePowerModifier
} = makeCrudHandlers("PowerModifier", insertPowerModifierSchema);
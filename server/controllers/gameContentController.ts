import { Request, Response } from "express";
import { storage } from "../storage";
import { 
  insertOriginSchema, insertArchetypeSchema, insertSkillSchema, 
  insertFeatSchema, insertSkillSetSchema, insertPowerSchema,
  insertPowerSetSchema, insertPowerModifierSchema
} from "@shared/schema";
import { z } from "zod";

// Helper function to verify admin status
function isAdmin(req: Request): boolean {
  return req.session?.user?.isAdmin === true;
}

// Helper function to handle admin verification
function verifyAdmin(req: Request, res: Response): boolean {
  if (!isAdmin(req)) {
    res.status(403).json({ error: "Unauthorized. Admin access required." });
    return false;
  }
  return true;
}

// Helper function to handle validation errors
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

// Origins Controllers
export const getAllOrigins = async (_req: Request, res: Response) => {
  try {
    const origins = await storage.getAllOrigins();
    res.json(origins);
  } catch (error) {
    console.error("Error fetching origins:", error);
    res.status(500).json({ error: "Failed to fetch origins" });
  }
};

export const getOriginById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const origin = await storage.getOriginById(id);
    if (!origin) {
      return res.status(404).json({ error: "Origin not found" });
    }
    
    res.json(origin);
  } catch (error) {
    console.error("Error fetching origin:", error);
    res.status(500).json({ error: "Failed to fetch origin" });
  }
};

export const createOrigin = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertOriginSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const origin = await storage.createOrigin(validationResult.data);
    res.status(201).json(origin);
  } catch (error) {
    console.error("Error creating origin:", error);
    res.status(500).json({ error: "Failed to create origin" });
  }
};

export const updateOrigin = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    // Partial validation - allow subset of fields
    const validationResult = insertOriginSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedOrigin = await storage.updateOrigin(id, validationResult.data);
    if (!updatedOrigin) {
      return res.status(404).json({ error: "Origin not found" });
    }
    
    res.json(updatedOrigin);
  } catch (error) {
    console.error("Error updating origin:", error);
    res.status(500).json({ error: "Failed to update origin" });
  }
};

export const deleteOrigin = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    // Check if origin exists first
    const origin = await storage.getOriginById(id);
    if (!origin) {
      return res.status(404).json({ error: "Origin not found" });
    }
    
    await storage.deleteOrigin(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting origin:", error);
    res.status(500).json({ error: "Failed to delete origin" });
  }
};

// Archetypes Controllers
export const getAllArchetypes = async (_req: Request, res: Response) => {
  try {
    const archetypes = await storage.getAllArchetypes();
    res.json(archetypes);
  } catch (error) {
    console.error("Error fetching archetypes:", error);
    res.status(500).json({ error: "Failed to fetch archetypes" });
  }
};

export const getArchetypeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const archetype = await storage.getArchetypeById(id);
    if (!archetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }
    
    res.json(archetype);
  } catch (error) {
    console.error("Error fetching archetype:", error);
    res.status(500).json({ error: "Failed to fetch archetype" });
  }
};

export const createArchetype = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertArchetypeSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const archetype = await storage.createArchetype(validationResult.data);
    res.status(201).json(archetype);
  } catch (error) {
    console.error("Error creating archetype:", error);
    res.status(500).json({ error: "Failed to create archetype" });
  }
};

export const updateArchetype = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertArchetypeSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedArchetype = await storage.updateArchetype(id, validationResult.data);
    if (!updatedArchetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }
    
    res.json(updatedArchetype);
  } catch (error) {
    console.error("Error updating archetype:", error);
    res.status(500).json({ error: "Failed to update archetype" });
  }
};

export const deleteArchetype = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const archetype = await storage.getArchetypeById(id);
    if (!archetype) {
      return res.status(404).json({ error: "Archetype not found" });
    }
    
    await storage.deleteArchetype(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting archetype:", error);
    res.status(500).json({ error: "Failed to delete archetype" });
  }
};

// Skills Controllers
export const getAllSkills = async (_req: Request, res: Response) => {
  try {
    const skills = await storage.getAllSkills();
    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const skill = await storage.getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    res.json(skill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
};

export const createSkill = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertSkillSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const skill = await storage.createSkill(validationResult.data);
    res.status(201).json(skill);
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ error: "Failed to create skill" });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertSkillSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedSkill = await storage.updateSkill(id, validationResult.data);
    if (!updatedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    res.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const skill = await storage.getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    await storage.deleteSkill(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
};

// Feats Controllers
export const getAllFeats = async (_req: Request, res: Response) => {
  try {
    const feats = await storage.getAllFeats();
    res.json(feats);
  } catch (error) {
    console.error("Error fetching feats:", error);
    res.status(500).json({ error: "Failed to fetch feats" });
  }
};

export const getFeatById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const feat = await storage.getFeatById(id);
    if (!feat) {
      return res.status(404).json({ error: "Feat not found" });
    }
    
    res.json(feat);
  } catch (error) {
    console.error("Error fetching feat:", error);
    res.status(500).json({ error: "Failed to fetch feat" });
  }
};

export const createFeat = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertFeatSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const feat = await storage.createFeat(validationResult.data);
    res.status(201).json(feat);
  } catch (error) {
    console.error("Error creating feat:", error);
    res.status(500).json({ error: "Failed to create feat" });
  }
};

export const updateFeat = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertFeatSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedFeat = await storage.updateFeat(id, validationResult.data);
    if (!updatedFeat) {
      return res.status(404).json({ error: "Feat not found" });
    }
    
    res.json(updatedFeat);
  } catch (error) {
    console.error("Error updating feat:", error);
    res.status(500).json({ error: "Failed to update feat" });
  }
};

export const deleteFeat = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const feat = await storage.getFeatById(id);
    if (!feat) {
      return res.status(404).json({ error: "Feat not found" });
    }
    
    await storage.deleteFeat(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting feat:", error);
    res.status(500).json({ error: "Failed to delete feat" });
  }
};

// Similar controller implementations for SkillSets, Powers, PowerSets, and PowerModifiers...

// Skill Sets Controllers
export const getAllSkillSets = async (_req: Request, res: Response) => {
  try {
    const skillSets = await storage.getAllSkillSets();
    res.json(skillSets);
  } catch (error) {
    console.error("Error fetching skill sets:", error);
    res.status(500).json({ error: "Failed to fetch skill sets" });
  }
};

export const getSkillSetById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const skillSet = await storage.getSkillSetById(id);
    if (!skillSet) {
      return res.status(404).json({ error: "Skill set not found" });
    }
    
    res.json(skillSet);
  } catch (error) {
    console.error("Error fetching skill set:", error);
    res.status(500).json({ error: "Failed to fetch skill set" });
  }
};

export const createSkillSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertSkillSetSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const skillSet = await storage.createSkillSet(validationResult.data);
    res.status(201).json(skillSet);
  } catch (error) {
    console.error("Error creating skill set:", error);
    res.status(500).json({ error: "Failed to create skill set" });
  }
};

export const updateSkillSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertSkillSetSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedSkillSet = await storage.updateSkillSet(id, validationResult.data);
    if (!updatedSkillSet) {
      return res.status(404).json({ error: "Skill set not found" });
    }
    
    res.json(updatedSkillSet);
  } catch (error) {
    console.error("Error updating skill set:", error);
    res.status(500).json({ error: "Failed to update skill set" });
  }
};

export const deleteSkillSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const skillSet = await storage.getSkillSetById(id);
    if (!skillSet) {
      return res.status(404).json({ error: "Skill set not found" });
    }
    
    await storage.deleteSkillSet(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting skill set:", error);
    res.status(500).json({ error: "Failed to delete skill set" });
  }
};

// Powers Controllers
export const getAllPowers = async (_req: Request, res: Response) => {
  try {
    const powers = await storage.getAllPowers();
    res.json(powers);
  } catch (error) {
    console.error("Error fetching powers:", error);
    res.status(500).json({ error: "Failed to fetch powers" });
  }
};

export const getPowerById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const power = await storage.getPowerById(id);
    if (!power) {
      return res.status(404).json({ error: "Power not found" });
    }
    
    res.json(power);
  } catch (error) {
    console.error("Error fetching power:", error);
    res.status(500).json({ error: "Failed to fetch power" });
  }
};

export const createPower = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertPowerSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const power = await storage.createPower(validationResult.data);
    res.status(201).json(power);
  } catch (error) {
    console.error("Error creating power:", error);
    res.status(500).json({ error: "Failed to create power" });
  }
};

export const updatePower = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertPowerSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedPower = await storage.updatePower(id, validationResult.data);
    if (!updatedPower) {
      return res.status(404).json({ error: "Power not found" });
    }
    
    res.json(updatedPower);
  } catch (error) {
    console.error("Error updating power:", error);
    res.status(500).json({ error: "Failed to update power" });
  }
};

export const deletePower = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const power = await storage.getPowerById(id);
    if (!power) {
      return res.status(404).json({ error: "Power not found" });
    }
    
    await storage.deletePower(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting power:", error);
    res.status(500).json({ error: "Failed to delete power" });
  }
};

// Power Sets Controllers
export const getAllPowerSets = async (_req: Request, res: Response) => {
  try {
    const powerSets = await storage.getAllPowerSets();
    res.json(powerSets);
  } catch (error) {
    console.error("Error fetching power sets:", error);
    res.status(500).json({ error: "Failed to fetch power sets" });
  }
};

export const getPowerSetById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const powerSet = await storage.getPowerSetById(id);
    if (!powerSet) {
      return res.status(404).json({ error: "Power set not found" });
    }
    
    res.json(powerSet);
  } catch (error) {
    console.error("Error fetching power set:", error);
    res.status(500).json({ error: "Failed to fetch power set" });
  }
};

export const createPowerSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertPowerSetSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const powerSet = await storage.createPowerSet(validationResult.data);
    res.status(201).json(powerSet);
  } catch (error) {
    console.error("Error creating power set:", error);
    res.status(500).json({ error: "Failed to create power set" });
  }
};

export const updatePowerSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertPowerSetSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedPowerSet = await storage.updatePowerSet(id, validationResult.data);
    if (!updatedPowerSet) {
      return res.status(404).json({ error: "Power set not found" });
    }
    
    res.json(updatedPowerSet);
  } catch (error) {
    console.error("Error updating power set:", error);
    res.status(500).json({ error: "Failed to update power set" });
  }
};

export const deletePowerSet = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const powerSet = await storage.getPowerSetById(id);
    if (!powerSet) {
      return res.status(404).json({ error: "Power set not found" });
    }
    
    await storage.deletePowerSet(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting power set:", error);
    res.status(500).json({ error: "Failed to delete power set" });
  }
};

// Power Modifiers Controllers
export const getAllPowerModifiers = async (_req: Request, res: Response) => {
  try {
    const powerModifiers = await storage.getAllPowerModifiers();
    res.json(powerModifiers);
  } catch (error) {
    console.error("Error fetching power modifiers:", error);
    res.status(500).json({ error: "Failed to fetch power modifiers" });
  }
};

export const getPowerModifierById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const powerModifier = await storage.getPowerModifierById(id);
    if (!powerModifier) {
      return res.status(404).json({ error: "Power modifier not found" });
    }
    
    res.json(powerModifier);
  } catch (error) {
    console.error("Error fetching power modifier:", error);
    res.status(500).json({ error: "Failed to fetch power modifier" });
  }
};

export const createPowerModifier = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const validationResult = insertPowerModifierSchema.safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const powerModifier = await storage.createPowerModifier(validationResult.data);
    res.status(201).json(powerModifier);
  } catch (error) {
    console.error("Error creating power modifier:", error);
    res.status(500).json({ error: "Failed to create power modifier" });
  }
};

export const updatePowerModifier = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const validationResult = insertPowerModifierSchema.partial().safeParse(req.body);
    if (handleValidationError(res, validationResult)) return;
    
    const updatedPowerModifier = await storage.updatePowerModifier(id, validationResult.data);
    if (!updatedPowerModifier) {
      return res.status(404).json({ error: "Power modifier not found" });
    }
    
    res.json(updatedPowerModifier);
  } catch (error) {
    console.error("Error updating power modifier:", error);
    res.status(500).json({ error: "Failed to update power modifier" });
  }
};

export const deletePowerModifier = async (req: Request, res: Response) => {
  if (!verifyAdmin(req, res)) return;

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    const powerModifier = await storage.getPowerModifierById(id);
    if (!powerModifier) {
      return res.status(404).json({ error: "Power modifier not found" });
    }
    
    await storage.deletePowerModifier(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting power modifier:", error);
    res.status(500).json({ error: "Failed to delete power modifier" });
  }
};
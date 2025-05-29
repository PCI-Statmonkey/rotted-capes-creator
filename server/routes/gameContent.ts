import { Router, Request, Response, NextFunction } from "express";
import * as gameContentController from "../controllers/gameContentController";
import { verifyAdmin } from "../controllers/gameContentController";

// TypeScript session extension
declare module 'express-session' {
  export interface SessionData {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    }
  }
}

const router = Router();

// Middleware to ensure admin access
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized. Admin access required." });
  }
}

// Public routes (GET operations)
// Origins
router.get("/origins", gameContentController.getAllOrigins);
router.get("/origins/:id", gameContentController.getOriginById);

// Archetypes
router.get("/archetypes", gameContentController.getAllArchetypes);
router.get("/archetypes/:id", gameContentController.getArchetypeById);

// Skills
router.get("/skills", gameContentController.getAllSkills);
router.get("/skills/:id", gameContentController.getSkillById);

// Feats
router.get("/feats", gameContentController.getAllFeats);
router.get("/feats/:id", gameContentController.getFeatById);

// Skill Sets
router.get("/skill-sets", gameContentController.getAllSkillSets);
router.get("/skill-sets/:id", gameContentController.getSkillSetById);

// Powers
router.get("/powers", gameContentController.getAllPowers);
router.get("/powers/:id", gameContentController.getPowerById);

// Power Sets
router.get("/power-sets", gameContentController.getAllPowerSets);
router.get("/power-sets/:id", gameContentController.getPowerSetById);

// Power Modifiers
router.get("/power-modifiers", gameContentController.getAllPowerModifiers);
router.get("/power-modifiers/:id", gameContentController.getPowerModifierById);

// Admin routes (CREATE, UPDATE, DELETE operations)
// Origins
router.post("/origins", verifyAdmin, gameContentController.createOrigin);
router.patch("/origins/:id", ensureAdmin, gameContentController.updateOrigin);
router.delete("/origins/:id", ensureAdmin, gameContentController.deleteOrigin);

// Archetypes
router.post("/archetypes", ensureAdmin, gameContentController.createArchetype);
router.patch("/archetypes/:id", ensureAdmin, gameContentController.updateArchetype);
router.delete("/archetypes/:id", ensureAdmin, gameContentController.deleteArchetype);

// Skills
router.post("/skills", ensureAdmin, gameContentController.createSkill);
router.patch("/skills/:id", ensureAdmin, gameContentController.updateSkill);
router.delete("/skills/:id", ensureAdmin, gameContentController.deleteSkill);

// Feats
router.post("/feats", ensureAdmin, gameContentController.createFeat);
router.patch("/feats/:id", ensureAdmin, gameContentController.updateFeat);
router.delete("/feats/:id", ensureAdmin, gameContentController.deleteFeat);

// Skill Sets
router.post("/skill-sets", ensureAdmin, gameContentController.createSkillSet);
router.patch("/skill-sets/:id", ensureAdmin, gameContentController.updateSkillSet);
router.delete("/skill-sets/:id", ensureAdmin, gameContentController.deleteSkillSet);

// Powers
router.post("/powers", ensureAdmin, gameContentController.createPower);
router.patch("/powers/:id", ensureAdmin, gameContentController.updatePower);
router.delete("/powers/:id", ensureAdmin, gameContentController.deletePower);

// Power Sets
router.post("/power-sets", ensureAdmin, gameContentController.createPowerSet);
router.patch("/power-sets/:id", ensureAdmin, gameContentController.updatePowerSet);
router.delete("/power-sets/:id", ensureAdmin, gameContentController.deletePowerSet);

// Power Modifiers
router.post("/power-modifiers", ensureAdmin, gameContentController.createPowerModifier);
router.patch("/power-modifiers/:id", ensureAdmin, gameContentController.updatePowerModifier);
router.delete("/power-modifiers/:id", ensureAdmin, gameContentController.deletePowerModifier);

export default router;
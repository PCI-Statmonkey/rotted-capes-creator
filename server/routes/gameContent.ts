// server/routes/gameContent.ts

import {
  getAllManeuvers,
  createManeuver,
  updateManeuver,
  deleteManeuver,
  getAllOrigins,
  getOriginById,
  createOrigin,
  updateOrigin,
  deleteOrigin,
  getAllArchetypes,
  getArchetypeById,
  createArchetype,
  updateArchetype,
  deleteArchetype,
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getAllFeats,
  getFeatById,
  createFeat,
  updateFeat,
  deleteFeat,
  getAllSkillSets,
  getSkillSetById,
  createSkillSet,
  updateSkillSet,
  deleteSkillSet,
  getAllPowers,
  getPowerById,
  createPower,
  updatePower,
  deletePower,
  getAllPowerSets,
  getPowerSetById,
  createPowerSet,
  updatePowerSet,
  deletePowerSet,
  getAllPowerModifiers,
  getPowerModifierById,
  createPowerModifier,
  updatePowerModifier,
  deletePowerModifier,
  getAllOriginFeatures,
  getOriginFeatureById,
  createOriginFeature,
  updateOriginFeature,
  deleteOriginFeature,
  getAllGears,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
  verifyAdmin,
} from "../controllers/gameContentController";

import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// TypeScript session extension
declare module "express-session" {
  export interface SessionData {
    user: {
      id: string;
      username: string;
      isAdmin: boolean;
    };
  }
}

// Middleware to ensure admin access
function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized. Admin access required." });
  }
}

// ---------------- PUBLIC ROUTES (GET ONLY) ----------------

// Origins
router.get("/origins", getAllOrigins);
router.get("/origins/:id", getOriginById);

// Archetypes
router.get("/archetypes", getAllArchetypes);
router.get("/archetypes/:id", getArchetypeById);

// Skills
router.get("/skills", getAllSkills);
router.get("/skills/:id", getSkillById);

// Feats
router.get("/feats", getAllFeats);
router.get("/feats/:id", getFeatById);

// Skill Sets
router.get("/skill-sets", getAllSkillSets);
router.get("/skill-sets/:id", getSkillSetById);

// Powers
router.get("/powers", getAllPowers);
router.get("/powers/:id", getPowerById);

// Power Sets
router.get("/power-sets", getAllPowerSets);
router.get("/power-sets/:id", getPowerSetById);

// Power Modifiers
router.get("/power-modifiers", getAllPowerModifiers);
router.get("/power-modifiers/:id", getPowerModifierById);

// Origin Features
router.get("/origin-features", getAllOriginFeatures);
router.get("/origin-features/:id", getOriginFeatureById);

// Gear
router.get("/gear", getAllGears);
router.get("/gear/:id", getGearById);

// Maneuvers
router.get("/maneuvers", getAllManeuvers);

// ---------------- ADMIN ROUTES (POST / PATCH / DELETE) ----------------

// Origins
router.post("/origins", verifyAdmin, createOrigin);
router.patch("/origins/:id", ensureAdmin, updateOrigin);
router.delete("/origins/:id", ensureAdmin, deleteOrigin);

// Archetypes
router.post("/archetypes", ensureAdmin, createArchetype);
router.patch("/archetypes/:id", ensureAdmin, updateArchetype);
router.delete("/archetypes/:id", ensureAdmin, deleteArchetype);

// Skills
router.post("/skills", ensureAdmin, createSkill);
router.patch("/skills/:id", ensureAdmin, updateSkill);
router.delete("/skills/:id", ensureAdmin, deleteSkill);

// Feats
router.post("/feats", ensureAdmin, createFeat);
router.patch("/feats/:id", ensureAdmin, updateFeat);
router.delete("/feats/:id", ensureAdmin, deleteFeat);

// Skill Sets
router.post("/skill-sets", ensureAdmin, createSkillSet);
router.patch("/skill-sets/:id", ensureAdmin, updateSkillSet);
router.delete("/skill-sets/:id", ensureAdmin, deleteSkillSet);

// Powers
router.post("/powers", ensureAdmin, createPower);
router.patch("/powers/:id", ensureAdmin, updatePower);
router.delete("/powers/:id", ensureAdmin, deletePower);

// Power Sets
router.post("/power-sets", ensureAdmin, createPowerSet);
router.patch("/power-sets/:id", ensureAdmin, updatePowerSet);
router.delete("/power-sets/:id", ensureAdmin, deletePowerSet);

// Power Modifiers
router.post("/power-modifiers", ensureAdmin, createPowerModifier);
router.patch("/power-modifiers/:id", ensureAdmin, updatePowerModifier);
router.delete("/power-modifiers/:id", ensureAdmin, deletePowerModifier);

// Origin Features
router.post("/origin-features", ensureAdmin, createOriginFeature);
router.patch("/origin-features/:id", ensureAdmin, updateOriginFeature);
router.delete("/origin-features/:id", ensureAdmin, deleteOriginFeature);

// Gear
router.post("/gear", ensureAdmin, createGear);
router.patch("/gear/:id", ensureAdmin, updateGear);
router.delete("/gear/:id", ensureAdmin, deleteGear);

// Maneuvers
router.post("/maneuvers", verifyAdmin, createManeuver);
router.put("/maneuvers/:id", verifyAdmin, updateManeuver);
router.delete("/maneuvers/:id", verifyAdmin, deleteManeuver);

export default router;

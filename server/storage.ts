import { db } from "./db";
import {
  origins, archetypes, skills, feats, skillSets, powers,
  powerSets, powerModifiers, originFeatures, maneuvers, gear,
  characters
} from "@shared/schema";
import { eq } from "drizzle-orm";

export const storage = {
  // ORIGIN
  getAllOrigin: () => db.select().from(origins),
  getOriginById: (id: number) => db.query.origins.findFirst({ where: eq(origins.id, id) }),
  createOrigin: (data: any) => db.insert(origins).values(data).returning().then(r => r[0]),
  updateOrigin: (id: number, data: any) => db.update(origins).set(data).where(eq(origins.id, id)).returning().then(r => r[0]),
  deleteOrigin: (id: number) => db.delete(origins).where(eq(origins.id, id)),

  // ARCHETYPE
  getAllArchetype: () => db.select().from(archetypes),
  getArchetypeById: (id: number) => db.query.archetypes.findFirst({ where: eq(archetypes.id, id) }),
  createArchetype: (data: any) => db.insert(archetypes).values(data).returning().then(r => r[0]),
  updateArchetype: (id: number, data: any) => db.update(archetypes).set(data).where(eq(archetypes.id, id)).returning().then(r => r[0]),
  deleteArchetype: (id: number) => db.delete(archetypes).where(eq(archetypes.id, id)),

  // SKILL
  getAllSkill: () => db.select().from(skills),
  getSkillById: (id: number) => db.query.skills.findFirst({ where: eq(skills.id, id) }),
  createSkill: (data: any) => db.insert(skills).values(data).returning().then(r => r[0]),
  updateSkill: (id: number, data: any) => db.update(skills).set(data).where(eq(skills.id, id)).returning().then(r => r[0]),
  deleteSkill: (id: number) => db.delete(skills).where(eq(skills.id, id)),

  // FEAT
  getAllFeat: () => db.select().from(feats),
  getFeatById: (id: number) => db.query.feats.findFirst({ where: eq(feats.id, id) }),
  createFeat: (data: any) => db.insert(feats).values(data).returning().then(r => r[0]),
  updateFeat: (id: number, data: any) => db.update(feats).set(data).where(eq(feats.id, id)).returning().then(r => r[0]),
  deleteFeat: (id: number) => db.delete(feats).where(eq(feats.id, id)),

  // SKILL SET
  getAllSkillSet: () => db.select().from(skillSets),
  getSkillSetById: (id: number) => db.query.skillSets.findFirst({ where: eq(skillSets.id, id) }),
  createSkillSet: (data: any) => db.insert(skillSets).values(data).returning().then(r => r[0]),
  updateSkillSet: (id: number, data: any) => db.update(skillSets).set(data).where(eq(skillSets.id, id)).returning().then(r => r[0]),
  deleteSkillSet: (id: number) => db.delete(skillSets).where(eq(skillSets.id, id)),

  // CHARACTER
  getCharactersByUserId: (userId: number) =>
    db.select().from(characters).where(eq(characters.userId, userId)),
  getCharacterById: (id: number) =>
    db.query.characters.findFirst({ where: eq(characters.id, id) }),
  createCharacter: (data: any) =>
    db.insert(characters).values(data).returning().then(r => r[0]),
  updateCharacter: (id: number, data: any) =>
    db.update(characters).set(data).where(eq(characters.id, id)).returning().then(r => r[0]),
  deleteCharacter: (id: number) =>
    db.delete(characters).where(eq(characters.id, id)),

  // POWER
  getAllPower: () => db.select().from(powers),
  getPowerById: (id: number) => db.query.powers.findFirst({ where: eq(powers.id, id) }),
  createPower: (data: any) => db.insert(powers).values(data).returning().then(r => r[0]),
  updatePower: (id: number, data: any) => db.update(powers).set(data).where(eq(powers.id, id)).returning().then(r => r[0]),
  deletePower: (id: number) => db.delete(powers).where(eq(powers.id, id)),

  // POWER SET
  getAllPowerSet: () => db.select().from(powerSets),
  getPowerSetById: (id: number) => db.query.powerSets.findFirst({ where: eq(powerSets.id, id) }),
  createPowerSet: (data: any) => db.insert(powerSets).values(data).returning().then(r => r[0]),
  updatePowerSet: (id: number, data: any) => db.update(powerSets).set(data).where(eq(powerSets.id, id)).returning().then(r => r[0]),
  deletePowerSet: (id: number) => db.delete(powerSets).where(eq(powerSets.id, id)),

  // POWER MODIFIER
  getAllPowerModifier: () => db.select().from(powerModifiers),
  getPowerModifierById: (id: number) => db.query.powerModifiers.findFirst({ where: eq(powerModifiers.id, id) }),
  createPowerModifier: (data: any) => db.insert(powerModifiers).values(data).returning().then(r => r[0]),
  updatePowerModifier: (id: number, data: any) => db.update(powerModifiers).set(data).where(eq(powerModifiers.id, id)).returning().then(r => r[0]),
  deletePowerModifier: (id: number) => db.delete(powerModifiers).where(eq(powerModifiers.id, id)),

  // ORIGIN FEATURES
  getAllOriginFeature: () => db.select().from(originFeatures),
  getOriginFeatureById: (id: number) => db.query.originFeatures.findFirst({ where: eq(originFeatures.id, id) }),
  createOriginFeature: (data: any) => db.insert(originFeatures).values(data).returning().then(r => r[0]),
  updateOriginFeature: (id: number, data: any) => db.update(originFeatures).set(data).where(eq(originFeatures.id, id)).returning().then(r => r[0]),
  deleteOriginFeature: (id: number) => db.delete(originFeatures).where(eq(originFeatures.id, id)),

  // MANEUVERS
  getAllManeuver: () => db.select().from(maneuvers),
  getManeuverById: (id: number) => db.query.maneuvers.findFirst({ where: eq(maneuvers.id, id) }),
  createManeuver: (data: any) => db.insert(maneuvers).values(data).returning().then(r => r[0]),
  updateManeuver: (id: number, data: any) => db.update(maneuvers).set(data).where(eq(maneuvers.id, id)).returning().then(r => r[0]),
  deleteManeuver: (id: number) => db.delete(maneuvers).where(eq(maneuvers.id, id)),

  // GEAR
  getAllGear: () => db.select().from(gear),
  getGearById: (id: number) => db.query.gear.findFirst({ where: eq(gear.id, id) }),
  createGear: (data: any) => db.insert(gear).values(data).returning().then(r => r[0]),
  updateGear: (id: number, data: any) => db.update(gear).set(data).where(eq(gear.id, id)).returning().then(r => r[0]),
  deleteGear: (id: number) => db.delete(gear).where(eq(gear.id, id)),
};

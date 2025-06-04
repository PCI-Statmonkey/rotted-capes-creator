
// Combined seedGameContent.ts
import { db } from "../../db";
import {
  origins, archetypes, powers, powerSets, powerModifiers,
  feats, skills, skillSets, maneuvers, originFeatures
} from "../../../shared/schema";
import featsData from "../../../client/src/rules/Feats.json" assert { type: "json" };
import skillsData from "../../../client/src/rules/skills.json" assert { type: "json" };
import skillSetsData from "../../../client/src/rules/skillSets.json" assert { type: "json" };
import originsData from "../../../client/src/rules/origins.json" assert { type: "json" };
import archetypesData from "../../../client/src/rules/archetypes.json" assert { type: "json" };
import powersData from "../../../client/src/rules/powerMods.json" assert { type: "json" };
import powerSetsData from "../../../client/src/rules/powerSets.json" assert { type: "json" };
import powerModifiersData from "../../../client/src/rules/powerMods.json" assert { type: "json" };
import originFeaturesData from "../../../client/src/rules/origin_features.json" assert { type: "json" };
import maneuversData from "../../../client/src/rules/maneuvers.json" assert { type: "json" };
import gearData from "../../../client/src/rules/gear.json" assert { type: "json" };

async function runSeed() {
  console.log("🌱 Seeding skills...");
  for (const skill of skillsData) {
    await db.insert(skills).values({
      name: skill.name,
      ability: skill.ability || "Intelligence",
      description: skill.description || "",
      untrained: skill.untrained ?? true,
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding feats...");
  for (const feat of featsData) {
    await db.insert(feats).values({
      name: feat.name,
      description: feat.description || "",
      prerequisites: feat.prerequisite ? [feat.prerequisite] : [],
      tags: feat.tags || [],
      notes: feat.notes || "",
      benefits: feat.benefits || "",
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding skill sets...");
  for (const set of skillSetsData) {
    await db.insert(skillSets).values({
      name: set.name,
      points: set.points || 0,
      skills: set.skills.map(s => typeof s === "string" ? { name: s } : s),
      feats: set.feats || [],
      description: set.description || "",
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding origins...");
  for (const origin of originsData) {
    await db.insert(origins).values({
      name: origin.name,
      description: origin.description || "",
      special_ability: origin.special_ability || "",
      image_url: origin.image || "",
      ability_bonuses: origin.ability_bonuses || {},
      origin_features: origin.origin_features || [],
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding origin features...");
  for (const feature of originFeaturesData) {
  await db.insert(originFeatures).values({
    name: feature.name,
    description: feature.description || "",
    effectType: feature.effectType || "story",
    effect: feature.effect || "",
  }).onConflictDoNothing();
  }

  console.log("🌱 Seeding archetypes...");
  for (const arch of archetypesData) {
    await db.insert(archetypes).values({
      name: arch.name,
      description: arch.description || "",
      keyAbilities: arch.keyAbilities || [],
      specialAbility: arch.specialAbility || "",
      trainedSkill: arch.trainedSkill || "",
      imageUrl: arch.imageUrl || "",
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding powers...");
  for (const power of powersData) {
    await db.insert(powers).values({
      name: power.name,
      description: power.description || "",
      hasDamageType: power.hasDamageType || false,
      hasTarget: power.hasTarget || false,
      skillCompatible: power.skillCompatible || false,
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding power sets...");
  for (const ps of powerSetsData) {
    await db.insert(powerSets).values({
      name: ps.name,
      powers: ps.powers || [],
      requiredArchetypes: ps.requiredArchetypes || [],
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding power modifiers...");
  for (const mod of powerModifiersData) {
    await db.insert(powerModifiers).values({
      name: mod.name,
      description: mod.effect || "",
      bonus: mod.value || 0,
      type: mod.type || "perk",
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding maneuvers...");
  for (const maneuver of maneuversData) {
    await db.insert(maneuvers).values({
      name: maneuver.name,
      type: maneuver.type,
      requirements: maneuver.requirements || [],
    }).onConflictDoNothing();
 
  }

console.log("🌱 Seeding complete ✅");

}

runSeed()
  .then(() => {
    console.log("✅ Seed completed successfully.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Seeding failed!");
    console.error("Type:", typeof e);
    console.error("Message:", e?.message || "No message");
    console.error("Full Error:", JSON.stringify(e, null, 2));
    console.error("Stack:", e?.stack || "No stack");
    process.exit(1);
  });

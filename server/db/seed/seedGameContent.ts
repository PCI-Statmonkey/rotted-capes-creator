
// Combined seedGameContent.ts
import { db } from "../../db";
import {
  origins,
  archetypes,
  powers,
  powerSets,
  powerModifiers,
  weaknesses,
  feats,
  skillSets,
  maneuvers,
  originFeatures,
  gear,
} from "../../../shared/schema";
import featsData from "../../../client/src/rules/feats.json" with { type: "json" };
import skillSetsData from "../../../client/src/rules/skills.json" with { type: "json" };
import originsData from "../../../client/src/rules/origins.json" with { type: "json" };
import archetypesData from "../../../client/src/rules/archetypes.json" with { type: "json" };
import powersData from "../../../client/src/rules/powers.json" with { type: "json" };
import powerSetsData from "../../../client/src/rules/powerSets.json" with { type: "json" };
import powerModifiersData from "../../../client/src/rules/powerMods.json" with { type: "json" };
import originFeaturesData from "../../../client/src/rules/origin_features.json" with { type: "json" };
import maneuversData from "../../../client/src/rules/maneuvers.json" with { type: "json" };
import gearData from "../../../client/src/rules/gear.json" with { type: "json" };
import weaknessesData from "../../../client/src/rules/weaknesses.json" with { type: "json" };

async function runSeed() {
  console.log("🌱 Seeding feats...");
  for (const feat of featsData as any[]) {
    await db.insert(feats).values({
      name: feat.name,
      description: feat.description || "",
      type: feat.type ?? "normal",
      repeatable: feat.repeatable ?? false,
      prerequisites: feat.prerequisites ?? [],
      tags: feat.tags ?? [],
      notes: feat.notes ?? "",
      input_label: feat.input_label ?? null,
    } as any).onConflictDoNothing();
  }

  console.log("🌱 Seeding skill sets...");
  for (const set of skillSetsData as any[]) {
    await db.insert(skillSets).values({
      name: set.name,
      description: set.description || "",
      // Older database snapshots expect these fields even if our source data
      // doesn't explicitly provide them. Defaults keep the insert from failing
      // on NOT NULL constraints.
      points: set.points ?? 0,
      skills: set.skills ?? [],
      feats: set.feats ?? [],
      edges: set.edges ?? [],
      deepCutTrigger: set.deepCutTrigger ?? null,
    } as any).onConflictDoNothing();
  }

  console.log("🌱 Seeding origins...");
  for (const origin of originsData as any[]) {
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
  for (const feature of originFeaturesData as any[]) {
  await db.insert(originFeatures).values({
    name: feature.name,
    description: feature.description || "",
    effectType: feature.effectType || "story",
    effect: feature.effect || "",
  }).onConflictDoNothing();
  }

  console.log("🌱 Seeding archetypes...");
  for (const arch of archetypesData as any[]) {
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
  for (const power of powersData as any[]) {
    await db.insert(powers).values({
      name: power.name,
      description: power.description || "",
      hasDamageType: power.hasDamageType || false,
      hasTarget: power.hasTarget || false,
      skillCompatible: power.skillCompatible || false,
      burnout: power.burnout || null,
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding power sets...");
  for (const ps of powerSetsData as any[]) {
    await db.insert(powerSets).values({
      name: ps.name,
      powers: ps.powers || [],
      requiredArchetypes: ps.requiredArchetypes || [],
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding power modifiers...");
  for (const mod of powerModifiersData as any[]) {
    await db.insert(powerModifiers).values({
      name: mod.name,
      description: mod.effect || "",
      bonus: mod.value || 0,
      type: mod.type || "perk",
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding weaknesses...");
  for (const wk of weaknessesData as any[]) {
    await db.insert(weaknesses).values({
      name: wk.name,
      description: wk.description || "",
      baseCost: wk.baseCost ?? 0,
    }).onConflictDoNothing();
  }

  console.log("🌱 Seeding maneuvers...");
  for (const maneuver of maneuversData as any[]) {
    await db.insert(maneuvers).values({
      name: maneuver.name,
      type: maneuver.type,
      requirements: maneuver.requirements || [],
      attack: maneuver.attack || "",
      action: maneuver.action || "",
      range: maneuver.range || "",
      effect: maneuver.effect || "",
      special: maneuver.special || null,
      weapons: maneuver.weapons || null,
    }).onConflictDoNothing();

  }

  console.log("🌱 Seeding gear...");
  // Clear existing gear to avoid stale or partial data
  await db.delete(gear);
  for (const [category, items] of Object.entries(gearData as any)) {
    if (!Array.isArray(items)) continue;
    for (const item of items as any[]) {
      await db.insert(gear).values({
        name: item.name,
        description: item.description || item.damage || "",
        category,
        ap: item.ap ?? item.costAP ?? 0,
        tags: item.qualities || item.tags || item.ammo_type || [],
        batteryPowered: item.batteryPowered ?? false,
      }).onConflictDoNothing();
    }
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

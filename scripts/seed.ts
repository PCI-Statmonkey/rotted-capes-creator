// scripts/seed.ts
import fs from "fs";
import path from "path";
import { db } from "../server/db";
import { origins, feats, maneuvers as maneuversTable } from "../shared/schema";
import { fileURLToPath } from "url";
import { dirname } from "path";
import maneuvers from "@/rules/maneuvers.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const originsPath = path.resolve(__dirname, "../client/src/rules/origins.json");
const featsPath = path.resolve(__dirname, "../client/src/rules/feats.json");

const originsData = JSON.parse(fs.readFileSync(originsPath, "utf-8"));
const featsData = JSON.parse(fs.readFileSync(featsPath, "utf-8"));

async function main() {
  console.log("🌱 Seeding origins...");

  for (const origin of originsData) {
    if (!origin.description) {
      console.error("❌ Missing description for origin:", origin.name);
      continue;
    }

    await db.insert(origins).values({
      name: origin.name,
      description: origin.description,
      ability_bonuses: origin.ability_bonuses,
      advantages: origin.advantages,
      disadvantages: origin.disadvantages,
      image: origin.image ?? null,
    });

    console.log(`✅ Inserted origin: ${origin.name}`);
  }

  console.log("🌱 Seeding feats...");

  for (const feat of featsData) {
    await db.insert(feats).values({
      name: feat.name,
      description: feat.description,
      type: feat.type ?? "normal",
      repeatable: feat.repeatable ?? false,
      prerequisites: feat.prerequisites ?? [],
      tags: feat.tags ?? [],
      notes: feat.notes ?? "",
      input_label: feat.input_label ?? null,
    });
    console.log(`✅ Inserted feat: ${feat.name}`);
  }

  console.log("🌱 Seeding maneuvers...");
  console.log("📦 Maneuver count:", maneuvers.length);

  await db.insert(maneuversTable).values(maneuvers);

  console.log("✅ Done seeding maneuvers.");
}

main().catch((err) => {
  console.error("❌ Error during seeding:", err);
});

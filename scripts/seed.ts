// scripts/seed.ts
import fs from "fs";
import path from "path";
import { db } from "../server/db";
import { origins } from "../shared/schema";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const originsPath = path.resolve(__dirname, "./origins_seed_data.json");
const originsData = JSON.parse(fs.readFileSync(originsPath, "utf-8"));

async function main() {
  console.log("🌱 Seeding origins...");

  for (const origin of originsData) {
    await db.insert(origins).values({
      name: origin.name,
      description: origin.description,
      stat_boosts: origin.stat_boosts,
      advantages: origin.advantages,
      disadvantages: origin.disadvantages,
    });
    console.log(`✅ Inserted: ${origin.name}`);
  }

  console.log("🌱 Seeding complete.");
}

main().catch((err) => {
  console.error("❌ Error during seeding:", err);
});


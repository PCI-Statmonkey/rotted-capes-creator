import { db } from "../server/db";
import { maneuvers } from "../shared/schema";
import seedData from "./maneuversSeedData.json";

async function seed() {
  try {
    await db.insert(maneuvers).values(seedData);
    console.log("✅ Maneuvers seeded successfully.");
  } catch (error) {
    console.error("❌ Seeding maneuvers failed:", error);
  }
}

seed();

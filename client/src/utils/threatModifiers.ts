import type { Threat } from "@/context/ThreatContext";

export interface ThreatMods {
  avoidance: number;
  fortitude: number;
  willpower: number;
  stamina: number;
  staminaMult: number;
  wounds: number;
  toHit: number;
  initiative: number;
  notes: {
    avoidance: string[];
    fortitude: string[];
    willpower: string[];
    stamina: string[];
    wounds: string[];
    toHit: string[];
    initiative: string[];
  };
}

// Pace types available for threats
export const PACE_TYPES = [
  "Walk",
  "Climb", 
  "Swim",
  "Fly",
  "Burrow",
  "Teleport",
  "Leap",
  "Swing"
];

// Calculate ability modifier from ability score
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Get suggested save DC based on threat rank
export function getSuggestedSaveDC(rank: string): number {
  const rankDCs: { [key: string]: number } = {
    "Zeta": 12,
    "Epsilon": 14,
    "Delta": 15,
    "Gamma": 16,
    "Beta": 17,
    "Alpha": 18
  };
  return rankDCs[rank] || 12;
}

// Get auto-generated features for a threat type
export function getAutoFeaturesForType(type: string): Array<{name: string, description: string, type: "trait" | "immunity" | "Damage Resistance" | "vulnerability" | "special"}> {
  const features = [];
  
  switch (type) {
    case "Animal":
      features.push({
        name: "Animal Instincts",
        description: "Enhanced senses and natural behavior patterns",
        type: "trait" as const
      });
      break;
    case "Construct (Robot/Tech)":
      features.push({
        name: "Mechanical Body",
        description: "Artificial construction with enhanced durability",
        type: "trait" as const
      });
      features.push({
        name: "Biological Immunity",
        description: "Immune to biological effects",
        type: "immunity" as const
      });
      break;
    case "Zombie":
      features.push({
        name: "Undead",
        description: "No longer alive, immune to many biological effects",
        type: "trait" as const
      });
      features.push({
        name: "Zombie Senses",
        description: "Enhanced ability to detect living creatures",
        type: "trait" as const
      });
      features.push({
        name: "Disease Immunity",
        description: "Immune to disease",
        type: "immunity" as const
      });
      features.push({
        name: "Poison Immunity", 
        description: "Immune to poison",
        type: "immunity" as const
      });
      break;
    case "Super Z":
      features.push({
        name: "Undead",
        description: "No longer alive, immune to many biological effects",
        type: "trait" as const
      });
      features.push({
        name: "Zombie Senses",
        description: "Enhanced ability to detect living creatures",
        type: "trait" as const
      });
      features.push({
        name: "Retained Intelligence",
        description: "Maintains pre-death intelligence and abilities",
        type: "trait" as const
      });
      features.push({
        name: "Disease Immunity",
        description: "Immune to disease",
        type: "immunity" as const
      });
      features.push({
        name: "Poison Immunity",
        description: "Immune to poison", 
        type: "immunity" as const
      });
      break;
    case "Abomination":
      features.push({
        name: "Unnatural Anatomy",
        description: "Twisted and horrifying form",
        type: "trait" as const
      });
      break;
  }
  
  return features;
}

export function calculateThreatMods(threat: Threat): ThreatMods {
  const mods: ThreatMods = {
    avoidance: 0,
    fortitude: 0,
    willpower: 0,
    stamina: 0,
    staminaMult: 1,
    wounds: 0,
    toHit: 0,
    initiative: 0,
    notes: {
      avoidance: [],
      fortitude: [],
      willpower: [],
      stamina: [],
      wounds: [],
      toHit: [],
      initiative: [],
    },
  };

  // Role adjustments
  switch (threat.role) {
    case "Skillful":
      mods.willpower += 1;
      mods.notes.willpower.push("+1 Willpower from Skillful role");
      break;
    case "Striker":
      mods.stamina += 10;
      mods.toHit += 1;
      mods.notes.stamina.push("+10 Stamina from Striker role");
      mods.notes.toHit.push("+1 to hit from Striker role");
      break;
    case "Bruiser":
      mods.staminaMult *= 2;
      mods.avoidance -= 1;
      mods.willpower -= 1;
      mods.notes.stamina.push("x2 Stamina from Bruiser role");
      mods.notes.avoidance.push("-1 Avoidance from Bruiser role");
      mods.notes.willpower.push("-1 Willpower from Bruiser role");
      break;
    case "Ranged":
      mods.toHit += 1;
      mods.avoidance += 1;
      mods.notes.toHit.push("+1 to hit from Ranged role");
      mods.notes.avoidance.push("+1 Avoidance from Ranged role");
      break;
    case "Controller":
      mods.toHit += 1;
      mods.avoidance -= 1;
      mods.notes.toHit.push("+1 to hit from Controller role");
      mods.notes.avoidance.push("-1 Avoidance from Controller role");
      break;
    case "Lurker":
      mods.toHit += 1;
      mods.avoidance += 1;
      mods.notes.toHit.push("+1 to hit from Lurker role");
      mods.notes.avoidance.push("+1 Avoidance from Lurker role");
      break;
  }

  // Type adjustments
  switch (threat.type) {
    case "Abomination":
      mods.wounds += 1;
      mods.avoidance -= 1;
      mods.notes.wounds.push("+1 Wound from Abomination type");
      mods.notes.avoidance.push("-1 Avoidance from Abomination type");
      break;
    case "Animal":
      mods.avoidance += 1;
      mods.notes.avoidance.push("+1 Avoidance from Animal type");
      break;
    case "Construct (Robot/Tech)":
      mods.stamina += 10;
      mods.fortitude += 2;
      mods.notes.stamina.push("+10 Stamina from Construct type");
      mods.notes.fortitude.push("+2 Fortitude from Construct type");
      break;
    case "Zombie":
      // Zombies have no stamina
      mods.stamina = -999; // Flag to set to 0
      mods.staminaMult = 0;
      mods.fortitude += 1;
      mods.notes.stamina.push("No Stamina (Undead)");
      mods.notes.fortitude.push("+1 Fortitude from Undead");
      break;
    case "Super Z":
      // Super Zombies have no stamina
      mods.stamina = -999; // Flag to set to 0
      mods.staminaMult = 0;
      mods.fortitude += 2;
      mods.willpower += 1;
      mods.notes.stamina.push("No Stamina (Undead)");
      mods.notes.fortitude.push("+2 Fortitude from Enhanced Undead");
      mods.notes.willpower.push("+1 Willpower from Retained Intelligence");
      break;
  }

  // Size adjustments
  switch (threat.size) {
    case "Tiny/Smaller":
      mods.avoidance += 2;
      mods.fortitude -= 2;
      mods.notes.avoidance.push("+2 Avoidance from Tiny size");
      mods.notes.fortitude.push("-2 Fortitude from Tiny size");
      break;
    case "Small":
      mods.avoidance += 1;
      mods.fortitude -= 1;
      mods.notes.avoidance.push("+1 Avoidance from Small size");
      mods.notes.fortitude.push("-1 Fortitude from Small size");
      break;
    case "Large":
      mods.avoidance -= 1;
      mods.fortitude += 1;
      mods.wounds += 1;
      mods.notes.avoidance.push("-1 Avoidance from Large size");
      mods.notes.fortitude.push("+1 Fortitude from Large size");
      mods.notes.wounds.push("+1 Wound from Large size");
      break;
    case "Huge":
      mods.avoidance -= 2;
      mods.fortitude += 2;
      mods.wounds += 2;
      mods.notes.avoidance.push("-2 Avoidance from Huge size");
      mods.notes.fortitude.push("+2 Fortitude from Huge size");
      mods.notes.wounds.push("+2 Wounds from Huge size");
      break;
    case "Gargantuan":
      mods.avoidance -= 4;
      mods.fortitude += 4;
      mods.wounds += 3;
      mods.notes.avoidance.push("-4 Avoidance from Gargantuan size");
      mods.notes.fortitude.push("+4 Fortitude from Gargantuan size");
      mods.notes.wounds.push("+3 Wounds from Gargantuan size");
      break;
  }

  return mods;
}

// Apply threat modifications to a threat object
export function applyThreatMods(threat: Threat): Threat {
  const mods = calculateThreatMods(threat);
  const modified = { ...threat };
  
  // Apply stamina modifications from base values to prevent doubling
  if (mods.stamina === -999) {
    // Special case for undead - set stamina to 0
    modified.stamina = 0;
  } else {
    // Use baseStamina if available, otherwise fall back to stamina
    const baseStamina = threat.baseStamina !== undefined ? threat.baseStamina : threat.stamina;
    modified.stamina = Math.max(0, Math.floor((baseStamina + mods.stamina) * mods.staminaMult));
  }
  
  // Apply defense modifications (only if defenses are assigned)
  if (threat.defenseAssigned) {
    modified.defenses = {
      avoidance: Math.max(1, threat.defenses.avoidance + mods.avoidance),
      fortitude: Math.max(1, threat.defenses.fortitude + mods.fortitude),
      willpower: Math.max(1, threat.defenses.willpower + mods.willpower)
    };
  }
  
  // Apply wounds modifications from base values to prevent doubling
  const baseWounds = threat.baseWounds !== undefined ? threat.baseWounds : threat.wounds;
  modified.wounds = Math.max(1, baseWounds + mods.wounds);
  
  // Calculate initiative: dex modifier + pace (minimum 1)
  const dexMod = getAbilityModifier(threat.abilityScores.dexterity);
  const basePace = threat.basePace || 2; // Default pace of 2
  modified.initiative = dexMod + Math.max(1, basePace) + mods.initiative;
  
  // Set pace display string
  modified.pace = `${Math.max(1, basePace)} areas`;
  
  return modified;
}


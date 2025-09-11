import type { Threat } from "@/context/ThreatContext";

export interface ThreatMods {
  avoidance: number;
  willpower: number;
  stamina: number;
  staminaMult: number;
  wounds: number;
  toHit: number;
  notes: {
    avoidance: string[];
    willpower: string[];
    stamina: string[];
    wounds: string[];
    toHit: string[];
  };
}

export function calculateThreatMods(threat: Threat): ThreatMods {
  const mods: ThreatMods = {
    avoidance: 0,
    willpower: 0,
    stamina: 0,
    staminaMult: 1,
    wounds: 0,
    toHit: 0,
    notes: {
      avoidance: [],
      willpower: [],
      stamina: [],
      wounds: [],
      toHit: [],
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
    case "Construct":
      mods.stamina += 10;
      mods.notes.stamina.push("+10 Stamina from Construct type");
      break;
  }

  // Size adjustments
  switch (threat.size) {
    case "Large":
      mods.avoidance -= 1;
      mods.wounds += 1;
      mods.notes.avoidance.push("-1 Avoidance from Large size");
      mods.notes.wounds.push("+1 Wound from Large size");
      break;
    case "Huge":
      mods.avoidance -= 2;
      mods.wounds += 2;
      mods.notes.avoidance.push("-2 Avoidance from Huge size");
      mods.notes.wounds.push("+2 Wounds from Huge size");
      break;
    case "Gargantuan":
      mods.avoidance -= 4;
      mods.wounds += 3;
      mods.notes.avoidance.push("-4 Avoidance from Gargantuan size");
      mods.notes.wounds.push("+3 Wounds from Gargantuan size");
      break;
  }

  return mods;
}


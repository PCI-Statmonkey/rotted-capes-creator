import type { Character } from "@/context/CharacterContext";

export function getOriginAbilityBonus(character: Pick<Character, "origin">, ability: string): number {
  const abilityLower = ability.toLowerCase();
  if (!character.origin) return 0;
  const originName = character.origin.split("(")[0].trim();

  if (originName === "Highly Trained" && character.origin.includes("Bonuses:")) {
    const bonusText = character.origin.match(/Bonuses: (.*)\)/)?.[1] || "";
    return bonusText.includes(`+1 ${ability.charAt(0).toUpperCase() + ability.slice(1)}`) ? 1 : 0;
  }

  if (originName === "Mystic" && character.origin.includes("(")) {
    if (character.origin.includes(":")) {
      const mysticType = character.origin.match(/Mystic \(([^:]+):/)?.[1]?.trim();
      if (mysticType === "Practitioner") {
        if (abilityLower === "wisdom") return 2;
        if (abilityLower === "charisma") return 1;
      } else if (mysticType === "The Chosen") {
        if (abilityLower === "wisdom") return 2;
        if (abilityLower === "constitution") return 1;
      } else if (mysticType === "Enchanter") {
        if (abilityLower === "wisdom") return 2;
        if (abilityLower === "intelligence") return 1;
      }
    } else {
      if (abilityLower === "wisdom") return 2;
      if (abilityLower === "charisma") return 1;
    }
    return 0;
  }

  if ((originName === "Cosmic" || originName === "Demigod") && character.origin.includes("(")) {
    const matches = Array.from(character.origin.matchAll(/\+(\d+) ([A-Za-z]+)/g));
    for (const m of matches) {
      const value = parseInt(m[1], 10);
      const abil = m[2].toLowerCase();
      if (abilityLower === abil) return value;
    }
    if (originName === "Cosmic" && abilityLower === "constitution") return 1;
    return 0;
  }

  switch (originName) {
    case "Alien":
      if (abilityLower === "strength") return 2;
      break;
    case "Android":
      if (abilityLower === "intelligence") return 2;
      break;
    case "Cosmic":
      if (abilityLower === "constitution") return 1;
      break;
    case "Super-Human":
      if (abilityLower === "constitution") return 2;
      break;
    case "Tech Hero":
      if (abilityLower === "intelligence") return 2;
      break;
  }
  return 0;
}

export function getArchetypeAbilityBonus(character: Pick<Character, "archetype">, ability: string): number {
  const abilityLower = ability.toLowerCase();
  if (!character.archetype) return 0;
  const archetypeName = character.archetype.split("(")[0].trim();
  switch (archetypeName) {
    case "Andromorph":
      if (abilityLower === "strength" || abilityLower === "dexterity") return 1;
      break;
    case "Blaster":
      if (abilityLower === "dexterity" || abilityLower === "charisma") return 1;
      break;
    case "Brawler":
      if (["strength", "dexterity", "constitution"].includes(abilityLower)) return 1;
      break;
    case "Controller":
      if (abilityLower === "wisdom" || abilityLower === "charisma") return 1;
      break;
    case "Heavy":
      if (abilityLower === "constitution" || abilityLower === "strength") return 1;
      break;
    case "Infiltrator":
      if (abilityLower === "dexterity" || abilityLower === "intelligence") return 1;
      break;
    case "Transporter":
      if (abilityLower === "dexterity" || abilityLower === "wisdom") return 1;
      break;
    case "Bruiser":
      if (abilityLower === "strength" || abilityLower === "constitution") return 1;
      break;
    case "Speedster":
      if (abilityLower === "dexterity") return 2;
      break;
    case "Defender":
      if (abilityLower === "constitution") return 2;
      break;
    case "Gadgeteer":
      if (abilityLower === "intelligence") return 2;
      break;
    case "Mentalist":
      if (abilityLower === "wisdom" || abilityLower === "intelligence") return 1;
      break;
    case "Mastermind":
      if (abilityLower === "intelligence" || abilityLower === "charisma") return 1;
      break;
    case "Shapeshifter":
      if (abilityLower === "constitution" || abilityLower === "dexterity") return 1;
      break;
  }
  return 0;
}

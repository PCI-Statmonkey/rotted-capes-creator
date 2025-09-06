import type { Character, Abilities } from "@/context/CharacterContext";
import { getScoreData } from "@/lib/utils";
import { getRankCap } from "@/utils/rank";
import featRules from "../rules/feats.json" with { type: "json" };

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

export function getPowerAbilityBonus(
  character: Pick<Character, "powers">,
  ability: string
): number {
  const abilityLower = ability.toLowerCase();
  return (character.powers || []).reduce((total, p: any) => {
    if (p.name?.startsWith("Enhanced Ability Score")) {
      const target = p.ability || p.name.match(/\(([^)]+)\)/)?.[1];
      if (target && target.toLowerCase().includes(abilityLower)) {
        const score = p.finalScore ?? p.score ?? 10;
        const mod = Math.max(1, getScoreData(score).modifier);
        return total + mod;
      }
    }
    return total;
  }, 0);
}

const featDescriptionMap = new Map(
  (featRules as any[]).map((f: any) => [f.name, (f.description || "").toLowerCase()])
);

export function getFeatAbilityBonus(
  character: Pick<Character, "feats">,
  ability: string
): number {
  const key = ability.toLowerCase();
  return (character.feats || []).reduce((total, f: any) => {
    if (f.name === "Ability Score Increase" && Array.isArray(f.abilityChoices)) {
      return total + f.abilityChoices.filter((ab: string) => ab.toLowerCase() === key).length;
    }
    if (Array.isArray(f.abilityChoices)) {
      return total + f.abilityChoices.filter((ab: string) => ab.toLowerCase() === key).length;
    }
    const desc = featDescriptionMap.get(f.name) || "";
    const regex = new RegExp(`increase[^.]*${key}[^.]*score[^.]*by\\s*\\+?(\\d+)`);
    const match = desc.match(regex);
    if (match) {
      const val = parseInt(match[1], 10);
      return total + (isNaN(val) ? 1 : val);
    }
    return total;
  }, 0);
}

export function getTotalAbilityBonus(character: Character, ability: string): number {
  return (
    getOriginAbilityBonus(character, ability) +
    getArchetypeAbilityBonus(character, ability) +
    getFeatAbilityBonus(character, ability) +
    getPowerAbilityBonus(character, ability)
  );
}

export function getEffectiveAbilities(character: Character): Abilities {
  const cap = getRankCap(character.rank);
  const result: any = {};
  (Object.keys(character.abilities) as (keyof Abilities)[]).forEach((ab) => {
    const base = character.abilities[ab].value;
    const bonus = getTotalAbilityBonus(character, ab);
    const value = Math.min(base + bonus, cap);
    result[ab] = { value, ...getScoreData(value) };
  });
  return result as Abilities;
}


import React, { useEffect, useRef, useMemo } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getScoreData, formatModifier, displayFeatName } from "@/lib/utils";
import { Check, Save, Shield, Heart, Target, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import CharacterPdfButton from "@/components/CharacterPdfButton";
import { parsePrerequisite, getMissingPrereqs, formatPrerequisite } from "@/utils/requirementValidator";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { getOriginAbilityBonus, getArchetypeAbilityBonus } from "@/utils/abilityBonuses";
import gearRules from "@/rules/gear.json" with { type: "json" };
import attackRules from "@/rules/attacks.json" with { type: "json" };
import powerRules from "@/rules/powers.json" with { type: "json" };
import featRules from "@/rules/feats.json" with { type: "json" };
import { getRankCap } from "@/utils/rank";

export default function Step10_Summary() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  const { selectedSkillSets, archetypeFeat } = useCharacterBuilder();
  const summaryRef = useRef<HTMLDivElement>(null);

  // Game content for gear and attacks with local fallbacks
  const gearContent = useCachedGameContent<any>("gear");
  const attackContent = useCachedGameContent<any>("attacks");
  const featContent = useCachedGameContent<any>("feats");
  const gearData = gearContent.data.length ? gearContent.data : (gearRules as any[]);
  const attackData = attackContent.data.length ? attackContent.data : (attackRules as any[]);
  const featData = featContent.data.length ? featContent.data : (featRules as any[]);
  const featMap = useMemo(() => new Map((featData as any[]).map((f: any) => [f.name, f])), [featData]);

  // Merge feats with any archetype bonus feat
  const feats = useMemo(() => {
    const list = [...character.feats];
    if (typeof archetypeFeat === "string" && !list.some(f => f.name === archetypeFeat)) {
      list.push({ name: archetypeFeat, source: "Archetype" });
    }
    return list;
  }, [character.feats, archetypeFeat]);

  // Determine weapons from gear list and map to attack data
  const weaponNames = useMemo(() => {
    const categories = [
      "firearms",
      "archaicWeapons",
      "meleeWeapons",
      "otherWeapons",
      "otherModernWeapons",
    ];
    return new Set(
      (gearData as any[])
        .filter(g => categories.includes(g.category))
        .map(g => g.name)
    );
  }, [gearData]);

  const gearMap = useMemo(() => new Map((gearData as any[]).map((g: any) => [g.name, g])), [gearData]);
  const attackMap = useMemo(() => new Map((attackData as any[]).map((a: any) => [a.name, a])), [attackData]);
  const powerDataMap = useMemo(
    () => new Map((powerRules as any[]).map((p: any) => [p.name, p])),
    []
  );

  const weaponAttacks = useMemo(
    () =>
      character.gear
        .map((g, index) => ({ g, index }))
        .filter(({ g }) => weaponNames.has(g.name) || weaponNames.has(g.description))
        .map(({ g, index }) => {
          const baseName = weaponNames.has(g.name)
            ? g.name
            : g.description || g.name;
          const gearInfo = gearMap.get(baseName);
          return {
            index,
            // Display the selected weapon name (example) while using the
            // base item name for lookup data like category and attacks
            name: g.name,
            category: gearInfo?.category,
            attack: attackMap.get(baseName),
            ability: (g as any).ability as "strength" | "dexterity" | undefined,
          };
        }),
    [character.gear, weaponNames, gearMap, attackMap]
  );

  const updateWeaponAbility = (
    index: number,
    ability: "strength" | "dexterity"
  ) => {
    const newGear = [...character.gear];
    (newGear[index] as any).ability = ability;
    updateCharacterField("gear", newGear);
  };

  // Attack powers are powers with an attack or damage type
  const attackPowers = useMemo(
    () => character.powers.filter(p => (p as any).attack || p.damageType),
    [character.powers]
  );

  // Map of attack and damage bonuses from feats like Attack Focus
  const attackBonuses = useMemo(() => {
    const map = new Map<string, { attack: number; damage: number; sources: string[] }>();
    feats.forEach((f: any) => {
      if (f.name === "Attack Focus" && typeof f.input === "string") {
        const target = f.input;
        const entry = map.get(target) || { attack: 0, damage: 0, sources: [] };
        entry.attack += 1;
        entry.damage += 2;
        entry.sources.push("Attack Focus");
        map.set(target, entry);
      }
    });
    return map;
  }, [feats]);

  const featAbilityBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    };
    feats.forEach((f: any) => {
      if (f.name === "Ability Score Increase") return;
      if (Array.isArray(f.abilityChoices)) {
        f.abilityChoices.forEach((ab: string) => {
          const key = ab.toLowerCase();
          if (key in bonuses) bonuses[key] += 1;
        });
        return;
      }
      const desc = (featMap.get(f.name)?.description || "").toLowerCase();
      (Object.keys(bonuses) as string[]).forEach((ab) => {
        const regex = new RegExp(`increase[^.]*${ab}[^.]*score[^.]*by\\s*\\+?(\\d+)`);
        const match = desc.match(regex);
        if (match) {
          const val = parseInt(match[1], 10);
          bonuses[ab] += isNaN(val) ? 1 : val;
        }
      });
    });
    return bonuses;
  }, [feats, featMap]);

  const getFeatBonus = (ability: string): number => {
    const key = ability.toLowerCase();
    return featAbilityBonuses[key] || 0;
  };

  const getPowerBonus = (ability: string): number => {
    return character.powers.reduce((total, p) => {
      if (p.name.startsWith("Enhanced Ability Score")) {
        const target = p.ability || p.name.match(/\(([^)]+)\)/)?.[1];
        if (target && target.toLowerCase().includes(ability.toLowerCase())) {
          const score = (p as any).finalScore ?? p.score ?? 10;
          const mod = Math.max(1, getScoreData(score).modifier);
          return total + mod;
        }
      }
      return total;
    }, 0);
  };

  const getTotalBonus = (ability: string): number => {
    return (
      getOriginAbilityBonus(character, ability) +
      getArchetypeAbilityBonus(character, ability) +
      getFeatBonus(ability) +
      getPowerBonus(ability)
    );
  };

  const cap = getRankCap(character.rank);
  const effectiveAbilities = useMemo(() => {
    const result: any = {};
    (Object.keys(character.abilities) as (keyof typeof character.abilities)[]).forEach((ab) => {
      const base = character.abilities[ab].value;
      const bonus = getTotalBonus(ab);
      const value = Math.min(base + bonus, cap);
      result[ab] = { ...getScoreData(value), value, powerBonus: getPowerBonus(ab) };
    });
    return result;
  }, [character, cap, featAbilityBonuses]);

  const getFinalPowerScore = (power: any) => {
    const flaws = power.flaws?.map((f: string) => f.toLowerCase()) || [];
    const isInborn = !flaws.some((f: string) =>
      f.includes("external power source") ||
      f.includes("all-skill") ||
      f.includes("removable")
    );
    const baseScore = power.finalScore ?? power.score ?? 0;
    return isInborn ? baseScore + 1 : baseScore;
  };

  const getPowerAbility = (
    power: any
  ): keyof typeof character.abilities | undefined => {
    if (power.ability) {
      const key = power.ability.toLowerCase();
      if (key in character.abilities) return key as keyof typeof character.abilities;
    }
    const desc = powerDataMap.get(power.name)?.description || "";
    const match = desc.match(/Primary Ability:\s*([^*\n]+)/i);
    if (!match) return undefined;
    const ability = match[1]
      .split(/,|or/)
      .map((o: string) => o.trim().toLowerCase())
      .find((a: string) => a in character.abilities);
    return ability as keyof typeof character.abilities | undefined;
  };

  const weaponAttackStats = useMemo(() => {
    const rangedCategories = [
      "firearms",
      "archaicWeapons",
      "otherWeapons",
      "otherModernWeapons",
    ];

    const parseDie = (die: string) => {
      const match = die.match(/\d+d(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    };

    return weaponAttacks.map((w) => {
      const isRanged = rangedCategories.includes(w.category);
      const baseDamageDie = w.attack?.damage ? parseDie(w.attack.damage) : 0;
      const canChooseAbility =
        !isRanged &&
        w.attack?.damage &&
        baseDamageDie < 8 &&
        ["slashing", "piercing"].includes(
          (w.attack.damageType || "").toLowerCase()
        );

      const abilityKey: "strength" | "dexterity" = isRanged
        ? "dexterity"
        : canChooseAbility
        ? w.ability || "strength"
        : "strength";

      const abilityMod = effectiveAbilities[abilityKey].modifier;
      const bonus = attackBonuses.get(w.name) || { attack: 0, damage: 0 };
      const toHit =
        abilityMod + character.rankBonus + (w.attack?.bonus || 0) + bonus.attack;
      const damageBonus = abilityMod + bonus.damage;
      const baseDamage = w.attack?.damage || "";
      const damage = baseDamage + (damageBonus ? formatModifier(damageBonus) : "");
      const damageType = w.attack?.damageType || "";
      const rangeValue = w.attack
        ? w.attack.range > 1
          ? w.attack.range
          : "Melee"
        : "";
      const rangeText = isRanged ? `Range: ${rangeValue}` : "Melee";

      return {
        index: w.index,
        name: w.name,
        line: `${w.name} ${formatModifier(toHit)}, ${damage}${
          damageType ? `(${damageType})` : ""
        }, ${rangeText}`,
        ability: abilityKey,
        canChooseAbility,
      };
    });
  }, [weaponAttacks, effectiveAbilities, character.rankBonus, attackBonuses]);

  const powerAttackLines = useMemo(() => {
    return attackPowers.map((p: any) => {
      const abilityKey = getPowerAbility(p);
      const abilityMod = abilityKey ? effectiveAbilities[abilityKey].modifier : 0;
      const finalScore = getFinalPowerScore(p);
      const scoreData = getScoreData(finalScore);
      const baseDie = scoreData.baseDie.startsWith("d")
        ? `1${scoreData.baseDie}`
        : scoreData.baseDie;
      const bonus = attackBonuses.get(p.name) || { attack: 0, damage: 0 };
      const toHit = abilityMod + character.rankBonus + bonus.attack;
      const damageBonus = abilityMod + bonus.damage;
      const damage = baseDie + (damageBonus ? formatModifier(damageBonus) : "");
      const damageType = p.damageType || "";
      const range = scoreData.powerRange;
      return `${p.name}${
        p.damageType ? ` (${p.damageType})` : ""
      } ${formatModifier(toHit)} to hit, ${damage}${
        damageType ? `(${damageType})` : ""
      }, Range: ${range}`;
    });
  }, [attackPowers, effectiveAbilities, character.rankBonus, attackBonuses]);

  const attackCount = weaponAttackStats.length + powerAttackLines.length;

  // Calculate derived stats with breakdown of sources
  const calculateDerivedStats = () => {
    const strMod = effectiveAbilities.strength.modifier;
    const dexMod = effectiveAbilities.dexterity.modifier;
    const conMod = effectiveAbilities.constitution.modifier;
    const intMod = effectiveAbilities.intelligence.modifier;
    const wisMod = effectiveAbilities.wisdom.modifier;
    const chaMod = effectiveAbilities.charisma.modifier;

    const toughnessCount = feats.filter((f) => f.name === "Toughness").length;
    const hasQuick = feats.some((f) => f.name === "Quick");
    const disciplinedCount = feats.filter((f) => f.name === "Disciplined").length;

    const avoidanceBreakdown = [
      { source: "Base", value: 10 },
      { source: dexMod >= intMod ? "DEX mod" : "INT mod", value: Math.max(dexMod, intMod) },
      { source: "Rank", value: character.rankBonus },
    ];
    if (hasQuick) avoidanceBreakdown.push({ source: "Quick (feat)", value: 1 });
    const armorBulk = character.gear.reduce((total, g) => {
      const baseName = gearMap.has(g.name) ? g.name : g.description || g.name;
      const info = gearMap.get(baseName);
      if (info?.category === "armor") {
        return total + (info.bulk ?? 0);
      }
      return total;
    }, 0);
    if (armorBulk > 0) avoidanceBreakdown.push({ source: "Armor Bulk", value: -armorBulk });
    const avoidance = avoidanceBreakdown.reduce((s, b) => s + b.value, 0);

    const fortitudeBreakdown = [
      { source: "Base", value: 10 },
      { source: strMod >= conMod ? "STR mod" : "CON mod", value: Math.max(strMod, conMod) },
      { source: "Rank", value: character.rankBonus },
    ];
    if (toughnessCount > 0) fortitudeBreakdown.push({ source: "Toughness (feat)", value: toughnessCount });
    const fortitude = fortitudeBreakdown.reduce((s, b) => s + b.value, 0);

    const willpowerBreakdown = [
      { source: "Base", value: 10 },
      { source: chaMod >= wisMod ? "CHA mod" : "WIS mod", value: Math.max(chaMod, wisMod) },
      { source: "Rank", value: character.rankBonus },
    ];
    if (disciplinedCount > 0)
      willpowerBreakdown.push({ source: "Disciplined (feat)", value: disciplinedCount });
    const willpower = willpowerBreakdown.reduce((s, b) => s + b.value, 0);

    const staminaBreakdown = [
      { source: "Avoidance", value: avoidance },
      { source: "Fortitude", value: fortitude },
      { source: "Willpower", value: willpower },
    ];
    if (toughnessCount > 0)
      staminaBreakdown.push({ source: "Toughness (feat)", value: toughnessCount * 10 });
    const stamina = staminaBreakdown.reduce((s, b) => s + b.value, 0);

    const woundsBreakdown = [
      { source: "Base", value: Math.max(3, Math.ceil(conMod / 2)) },
    ];
    if (toughnessCount > 1)
      woundsBreakdown.push({ source: "Toughness (feat)", value: 1 });
    const wounds = woundsBreakdown.reduce((s, b) => s + b.value, 0);

    const initiativeBreakdown = [{ source: "DEX mod", value: dexMod }];
    const initiative = dexMod;

    const runningPaceBreakdown = [{ source: "DEX mod", value: Math.min(Math.max(dexMod, 1), 4) }];
    let runningPace = Math.min(Math.max(dexMod, 1), 4);
    if (hasQuick) {
      runningPace += 1;
      runningPaceBreakdown.push({ source: "Quick (feat)", value: 1 });
    }

    return {
      avoidance,
      fortitude,
      willpower,
      stamina,
      wounds,
      initiative,
      runningPace,
      breakdown: {
        avoidance: avoidanceBreakdown,
        fortitude: fortitudeBreakdown,
        willpower: willpowerBreakdown,
        stamina: staminaBreakdown,
        wounds: woundsBreakdown,
        initiative: initiativeBreakdown,
        runningPace: runningPaceBreakdown,
      },
    };
  };

  // Derived stats are calculated on the fly
  const derivedStats = calculateDerivedStats();

  const formatBreakdown = (items: { source: string; value: number }[]) =>
    items
      .map((item, index) => {
        const sign = item.value < 0 ? '' : index === 0 ? '' : '+';
        return `${item.source} ${sign}${item.value}`;
      })
      .join(', ');

  const prereqCharacterData = {
    abilityScores: Object.fromEntries(
      Object.entries(effectiveAbilities).map(([k, v]) => [k, (v as any).value])
    ),
    selectedSkills: [],
    startingSkills: [] as any[],
    selectedFeats: feats,
    selectedSkillSets,
    skillSets: [] as any[],
  };
  
  // Update character defense to match avoidance for compatibility
  useEffect(() => {
    updateCharacterField('defense', derivedStats.avoidance);
    updateCharacterField('fortitude', derivedStats.fortitude);
    updateCharacterField('willpower', derivedStats.willpower);
    updateCharacterField('initiative', derivedStats.initiative);
  }, [derivedStats, updateCharacterField]);

  const handleSaveCharacter = () => {
    saveCharacter();
    toast({
      title: "Character Saved",
      description: `${character.name} has been saved successfully.`,
    });
  };
  const handleFinishCharacter = async () => {
  try {
    const mockUserEmail = localStorage.getItem("mockUserEmail");
    const userId = 1; // TEMP: Replace with actual user lookup if needed

    const { powers, skills, gear, complications, ...base } = character;
    const powersWithBonus = powers.map(p => ({
      ...p,
      finalScore: getFinalPowerScore(p),
    }));

    const payload = {
      userId,
      name: character.name,
      data: {
        ...base,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      feats,
      powers: powersWithBonus,
      skills,
      gear,
      complications,
    };

    const response = await apiRequest('POST', '/api/characters', payload);

    if (!response.ok) {
      throw new Error("Failed to save character");
    }

    const result = await response.json();
    toast({
      title: "Character Finalized",
      description: `Your character has been saved as ID #${result.id}.`,
    });

    window.location.assign("/profile"); // or wherever you want to go next
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "There was a problem saving your character.",
    });
  }
};

  // Character point calculations
  const calculatePointsSpent = () => {
    // Abilities points (cost per point varies)
    let abilitiesPoints = 0;
    for (const ability in character.abilities) {
      const abilityValue = character.abilities[ability as keyof typeof character.abilities].value;
      // Points cost calculation: 10 is free, each point above costs 1 point
      abilitiesPoints += Math.max(0, abilityValue - 10);
    }

    // Skill points are no longer used; skill sets do not cost points here
    const skillsPoints = 0;

    // Powers points (varies by power)
    const powersPoints = character.powers.reduce((total, power) => {
      // Base cost for a power
      let powerCost = power.cost || 0;
      
      // Add cost for perks
      if (power.perks) {
        powerCost += power.perks.length;
      }
      
      // Subtract points for flaws
      if (power.flaws) {
        powerCost -= power.flaws.length;
      }
      
      return total + powerCost;
    }, 0);

    // Total points
    const totalPoints = abilitiesPoints + skillsPoints + powersPoints;

    return {
      abilities: abilitiesPoints,
      skills: skillsPoints,
      powers: powersPoints,
      total: totalPoints
    };
  };

  // Update points spent
  useEffect(() => {
    const pointsSpent = calculatePointsSpent();
    updateCharacterField('pointsSpent', pointsSpent);
  }, [character.abilities, character.powers, updateCharacterField]);

  return (
    <div className="container mx-auto px-4 py-6 font-comic" ref={summaryRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-500 font-comic">Step 10: Character Sheet</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveCharacter} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Character
          </Button>
          
          <CharacterPdfButton 
            character={character}
            elementRef={summaryRef}
            label="Download Sheet"
            variant="default"
          />
        </div>
      </div>
      
      {/* Character Sheet Header */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Name and Flaws */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-400">Name</Label>
                <h2 className="text-2xl font-bold font-display">{character.name || "Unnamed Hero"}</h2>
                <p className="text-gray-400 text-sm">{character.secretIdentity ? `Secret Identity: ${character.secretIdentity}` : ""}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Flaws</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {character.personalityFlaws && character.personalityFlaws.length > 0 ? 
                    character.personalityFlaws.map((flaw, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600">
                        {flaw}
                      </Badge>
                    )) : 
                    <span className="text-gray-500 text-sm">No flaws specified</span>
                  }
                </div>
              </div>
            </div>
            
            {/* Middle column - Origin/Archetype */}
            <div className="md:text-center space-y-4">
              <div>
                <Label className="text-sm text-gray-400">Origin/Archetype</Label>
                <p className="font-semibold">{character.origin || "No Origin"} / {character.archetype || "No Archetype"}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Concept</Label>
                <p className="font-semibold">{character.concept || "No Concept"}</p>
              </div>
            </div>
            
            {/* Right column - Tagline and Pace */}
            <div className="space-y-4 md:text-right">
              <div>
                <Label className="text-sm text-gray-400">Tagline</Label>
                <p className="font-semibold italic">"{character.tagline || "No tagline"}"</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Running Pace</Label>
                <p className="font-semibold">{derivedStats.runningPace} areas</p>
                <p className="text-xs text-gray-400">{formatBreakdown(derivedStats.breakdown.runningPace)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Abilities & Defenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Abilities Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center text-xl font-medium">Abilities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left py-2">Ability</th>
                  <th className="text-center py-2">Score</th>
                  <th className="text-center py-2">Bonus</th>
                  <th className="text-center py-2">Die</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Strength</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.strength.value}
                    {effectiveAbilities.strength.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.strength.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.strength.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Dexterity</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.dexterity.value}
                    {effectiveAbilities.dexterity.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.dexterity.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.dexterity.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Constitution</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.constitution.value}
                    {effectiveAbilities.constitution.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.constitution.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.constitution.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Intelligence</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.intelligence.value}
                    {effectiveAbilities.intelligence.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.intelligence.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.intelligence.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Wisdom</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.wisdom.value}
                    {effectiveAbilities.wisdom.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.wisdom.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.wisdom.baseDie || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2">Charisma</td>
                  <td className="text-center py-2 font-semibold">
                    {effectiveAbilities.charisma.value}
                    {effectiveAbilities.charisma.powerBonus > 0 && (
                      <Zap className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </td>
                  <td className="text-center py-2 font-semibold">{formatModifier(effectiveAbilities.charisma.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{effectiveAbilities.charisma.baseDie || '-'}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">Max Lift: {effectiveAbilities.strength.maxLift} (Push/Drag {effectiveAbilities.strength.maxPushDrag})</p>
          </CardContent>
        </Card>
        
        {/* Defenses Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center text-xl font-medium">Defenses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Avoidance</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  {derivedStats.avoidance}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.avoidance)}</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Fortitude</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  {derivedStats.fortitude}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.fortitude)}</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Willpower</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  {derivedStats.willpower}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.willpower)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Health Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center text-xl font-medium">Health & Initiative</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Stamina</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-green-400" />
                  {derivedStats.stamina}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.stamina)}</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Wounds</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  {derivedStats.wounds}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.wounds)}</p>
              </div>

              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Initiative</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  {formatModifier(derivedStats.initiative)}
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatBreakdown(derivedStats.breakdown.initiative)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Powers, Skill Sets, Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Powers Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Powers</span>
              <Badge variant="outline" className="ml-2">{character.powers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {character.powers.length > 0 ? (
              <div className="space-y-4">
                {character.powers.map((power, index) => {
                  const score = getFinalPowerScore(power);
                  const data = getScoreData(score);
                  // Some legacy data may omit perks or flaws arrays. Default to empty arrays
                  const perks = power.perks ?? [];
                  const flaws = power.flaws ?? [];
                  return (
                    <div key={index} className="border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{power.name}</h3>
                        {score > 0 && (
                          <Badge variant="secondary">{score}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Bonus: {formatModifier(data.modifier)}
                      </div>

                      {power.linkedPowers && power.linkedPowers.length > 0 && (
                        <div className="text-xs text-gray-300 mt-1">
                          <Label className="text-xs text-gray-400">Linked To:</Label>{" "}
                          {power.linkedPowers.join(", ")}
                        </div>
                      )}

                      {(perks.length > 0 || flaws.length > 0) && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {perks.length > 0 && (
                            <div>
                              <Label className="text-xs text-gray-400">Perks</Label>
                              <ul className="text-xs ml-4 list-disc">
                                {perks.map((perk, idx) => (
                                  <li key={idx}>{perk}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {flaws.length > 0 && (
                            <div>
                              <Label className="text-xs text-gray-400">Flaws</Label>
                              <ul className="text-xs ml-4 list-disc">
                                {flaws.map((flaw, idx) => (
                                  <li key={idx}>{flaw}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No powers defined</div>
            )}
          </CardContent>
        </Card>
        
        {/* Attacks Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Attacks</span>
              <Badge variant="outline" className="ml-2">{attackCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {attackCount > 0 ? (
              <ul className="list-disc list-inside text-sm space-y-1">
                {weaponAttackStats.map((w) => (
                  <li
                    key={`weapon-${w.index}`}
                    className="flex items-center gap-2"
                  >
                    <span>{w.line}</span>
                    {w.canChooseAbility && (
                      <select
                        className="ml-2 bg-gray-800 text-xs border border-gray-600 rounded"
                        value={w.ability}
                        onChange={(e) =>
                          updateWeaponAbility(
                            w.index,
                            e.target.value as "strength" | "dexterity"
                          )
                        }
                      >
                        <option value="strength">STR</option>
                        <option value="dexterity">DEX</option>
                      </select>
                    )}
                  </li>
                ))}
                {powerAttackLines.map((line, idx) => (
                  <li key={`power-${idx}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">No attacks defined</div>
            )}
          </CardContent>
        </Card>

        {/* Skill Sets and Gear */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center text-xl font-medium">
                <span className="flex-1">Skill Sets</span>
                <Badge variant="outline" className="ml-2">{selectedSkillSets.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {selectedSkillSets.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {selectedSkillSets.map((s, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{s.name}</span>
                      {s.edges && s.edges.length > 0 && (
                        <span>: {s.edges.join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500">No skill sets selected</div>
              )}
            </CardContent>
          </Card>

          {/* Gear Section */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center text-xl font-medium">
                <span className="flex-1">Gear</span>
                <Badge variant="outline" className="ml-2">{character.gear.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {character.gear.length > 0 ? (
                <div className="space-y-2">
                  {character.gear.map((item, index) => (
                    <div key={index} className="border-b border-gray-700 pb-2 last:border-0">
                      <div className="font-semibold">{item.name}</div>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">No gear acquired</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Complications and Feats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complications Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Complications</span>
              <Badge variant="outline" className="ml-2">{character.complications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {character.complications.length > 0 ? (
              <div className="space-y-3">
                {character.complications.map((complication, index) => (
                  <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{complication.name}</h3>
                      {complication.type && (
                        <Badge variant="outline">{complication.type}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{complication.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No complications defined</div>
            )}
          </CardContent>
        </Card>
        
        {/* Feats Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Feats</span>
              <Badge variant="outline" className="ml-2">{feats.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {feats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {feats.map((feat, index) => {
                  const prereqList = Array.isArray((feat as any).prerequisites)
                    ? (feat as any).prerequisites
                    : (feat as any).prerequisites
                    ? [(feat as any).prerequisites]
                    : [];
                  const parsed = prereqList.flatMap((p: any) =>
                    typeof p === "string" ? parsePrerequisite(p) : [p]
                  );
                  const formatReq = (req: any) => formatPrerequisite(req);
                  const missingObj = getMissingPrereqs(
                    feat,
                    prereqCharacterData
                  );
                  const missing = [...missingObj.hard, ...missingObj.soft].map(
                    formatReq
                  );
                  return (
                    <div key={index} className="border border-gray-700 rounded-lg p-2">
                      <div className="font-semibold">
                        {displayFeatName(feat.name)}
                        {feat.powerTrick && (
                          <span className="text-sm text-gray-400"> — {feat.powerTrick}</span>
                        )}
                        {feat.emulatedPower && (
                          <span className="text-sm text-gray-400"> — {feat.emulatedPower}</span>
                        )}
                      </div>
                      {feat.source && (
                        <div className="text-xs text-gray-400">Source: {feat.source}</div>
                      )}
                      {parsed.length > 0 && (
                        <div className="text-xs mt-1">
                          <span className="font-semibold text-white">Prerequisites:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {parsed.map((req: any, idx: number) => {
                              const text = formatReq(req);
                              const unmet = missing.includes(text);
                              return (
                                <li key={idx} className={unmet ? "text-red-500" : "text-white"}>
                                  {text}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No feats selected</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Character Completion Checklist */}
      <Card className="mb-6">
        <CardHeader className="py-3">
          <CardTitle className="text-xl font-medium">Character Completion Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.name ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.name ? "" : "text-gray-500"}>Character name created</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.secretIdentity ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.secretIdentity ? "" : "text-gray-500"}>Secret identity defined</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.concept ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.concept ? "" : "text-gray-500"}>Character concept written</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.appearance ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.appearance ? "" : "text-gray-500"}>Appearance described</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.origin ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.origin ? "" : "text-gray-500"}>Origin selected</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.archetype ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.archetype ? "" : "text-gray-500"}>Archetype selected</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.personalityFlaws && character.personalityFlaws.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.personalityFlaws && character.personalityFlaws.length > 0 ? "" : "text-gray-500"}>Personality flaws defined</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.tagline ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.tagline ? "" : "text-gray-500"}>Character tagline created</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${selectedSkillSets.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={selectedSkillSets.length > 0 ? "" : "text-gray-500"}>Skill sets selected</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.powers.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.powers.length > 0 ? "" : "text-gray-500"}>Powers defined</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.complications.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.complications.length > 0 ? "" : "text-gray-500"}>Complications selected</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.gear.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.gear.length > 0 ? "" : "text-gray-500"}>Gear acquired</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={() => {
            saveCharacter();
            toast({
              title: "Character Saved",
              description: `${character.name || "Your character"} has been saved successfully.`,
            });
          }} 
          variant="outline"
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Character
        </Button>
        
        <div className="flex space-x-4">
          <CharacterPdfButton
            character={character}
            elementRef={summaryRef}
            label="Download PDF"
            variant="secondary"
          />
          
          <Button 
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
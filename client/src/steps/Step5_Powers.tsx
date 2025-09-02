import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, Check, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useCharacter } from "@/context/CharacterContext";
import { getRankCap } from "@/utils/rank";
import { trackEvent } from "@/lib/analytics";
import { getScoreData, formatModifier } from "@/lib/utils";
import powersData from "@/rules/powers.json" with { type: "json" };
import powerSetsData from "@/rules/powerSets.json" with { type: "json" };
import powerModsData from "@/rules/powerMods.json" with { type: "json" };
import archetypesData from "@/rules/archetypes.json" with { type: "json" };

// Define the power sets
interface PowerSet {
  name: string;
  powers: {
    name: string;
    score: number;
    description?: string;
    hasDamageType?: boolean;
    hasTarget?: boolean;
  }[];
  requiredArchetypes?: string[];
}

// Define individual power
interface Power {
  name: string;
  score: number;
  arrayIndex?: number;
  description?: string;
  damageType?: string;
  target?: string;
  ability?: string;
  burnout?: number;
  uses?: number;
  linkedPowers?: string[];
  flaws: PowerModifier[];
  perks: PowerModifier[];
  finalScore: number;
}

// Power modifier interface
interface PowerModifier {
  name: string;
  description: string;
  bonus: number;
  type: string;
}

// Define which powers use damage types based on the Power chapter
const DAMAGE_TYPE_POWERS = [
  "Energy Blast",
  "Energy Explosion",
  "Energy Generation",
  "Energy Manipulation",
  "Energy Sheath",
  "Damaging Form",
  "Darkness",
  "Psychic Attack"
];

// Helper function to check if a power uses damage type
const powerUsesDamageType = (powerName: string): boolean => {
  return DAMAGE_TYPE_POWERS.includes(powerName);
};

const ABILITIES = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

const getAbilityOptions = (powerName: string): string[] => {
  const match = powerName.match(/Enhanced Ability Score(?: \(([^)]+)\))?/i);
  if (!match) return [];
  const options = match[1];
  if (!options) return ABILITIES;
  return options
    .split(/,|or/)
    .map((o) => o.trim())
    .filter((o) => ABILITIES.some((a) => a.toLowerCase() === o.toLowerCase()));
};

// Define the available power sets based on the rulebook
const POWER_SETS: PowerSet[] = powerSetsData as any;

// Power score arrays - from Rotted Capes 2.0 rulebook
const POWER_ARRAYS = [
  { name: "Array 1 (2 Powers)", scores: [20, 18] },
  { name: "Array 2 (3 Powers)", scores: [18, 16, 15] },
  { name: "Array 3 (4 Powers)", scores: [16, 16, 14, 14] },
  { name: "Array 4 (5 Powers)", scores: [16, 15, 14, 12, 12] }
];

// Power point buy costs - from Rotted Capes 2.0 rulebook
const POWER_COST_TABLE: { score: number; cost: number }[] = [
  { score: 9, cost: 1 },
  { score: 10, cost: 2 },
  { score: 11, cost: 3 },
  { score: 12, cost: 4 },
  { score: 13, cost: 5 },
  { score: 14, cost: 6 },
  { score: 15, cost: 8 },
  { score: 16, cost: 10 },
  { score: 17, cost: 12 },
  { score: 18, cost: 14 },
  { score: 19, cost: 16 },
  { score: 20, cost: 18 }
];

// Complete list of powers
const ALL_POWERS = (powersData as any[]).map((p: any) => p.name);

const powerDataMap = new Map((powersData as any[]).map((p: any) => [p.name, p]));

// Powers compatible with the All Skill power modifier
const ALL_SKILL_COMPATIBLE = [
  "Catfall",
  "Celerity",
  "Endurance",
  "Enhanced Attack",
  "Enhanced Ability Score",
  "Enhanced Sense",
  "Inventive Gadgetry",
  "Luck",
  "Manifest Gear",
  "Sixth Sense",
  "Surge"
];

// Power modifiers from rule data
const RAW_MODIFIERS = powerModsData as any[];
const POWER_FLAWS: PowerModifier[] = RAW_MODIFIERS
  .filter(m => (m.type as string).toLowerCase().includes('flaw'))
  .map(m => ({ name: m.name, description: m.effect, bonus: m.value, type: m.type }));
const POWER_PERKS: PowerModifier[] = RAW_MODIFIERS
  .filter(m => (m.type as string).toLowerCase().includes('perk'))
  .map(m => ({ name: m.name, description: m.effect, bonus: m.value, type: m.type }));

// Available damage types
const DAMAGE_TYPES = [
  "Kinetic", "Fire", "Cold", "Electrical", "Acid", "Sonic", 
  "Light", "Radiation", "Dark", "Force", "Psychic"
];

export default function Step5_Powers() {
  const { character, updateCharacterField, setCurrentStep, updateDerivedStats } = useCharacter();
  const [powerCreationMethod, setPowerCreationMethod] = useState<"powerSet" | "array" | "pointBuy">("powerSet");
  const [selectedPowerSet, setSelectedPowerSet] = useState<string>("");
  const [selectedPowerArray, setSelectedPowerArray] = useState<string>("");
  const [availablePoints, setAvailablePoints] = useState<number>(32);
  const [selectedPowers, setSelectedPowers] = useState<Power[]>([]);
  const [activeTab, setActiveTab] = useState<string>("powers");

  const archetypeInfo = (archetypesData as any[]).find((a: any) => a.name === character.archetype);
  const archetypeTypicalPowers: string[] = archetypeInfo?.typical_powers || [];
  const archetypePowerBonusValue: number = archetypeInfo?.mechanics?.power_bonus?.value || 0;
  const [archetypeBonusPower, setArchetypeBonusPower] = useState<string | null>(null);
  const eligibleBonusPowers = selectedPowers.filter(p => archetypeTypicalPowers.includes(p.name));

  const totalBurnout = selectedPowers.reduce((sum, p) => sum + (p.burnout || 0) * (p.uses || 0), 0);
  useEffect(() => {
    updateCharacterField('currentBurnout', totalBurnout);
    const checks = totalBurnout > character.burnoutThreshold ? 1 : 0;
    updateCharacterField('burnoutChecks', checks);
  }, [totalBurnout, updateCharacterField, character.burnoutThreshold]);

  // Load powers from character when component mounts
  useEffect(() => {
    if (character.powers && character.powers.length > 0) {
      let loaded: Power[] = character.powers.map(p => ({
        name: p.name,
        score: p.score || 10,
        arrayIndex: undefined as number | undefined,
        description: p.description || powerDataMap.get(p.name)?.description,
        burnout: (p as any).burnout ?? (powerDataMap.get(p.name)?.burnout ? parseInt(powerDataMap.get(p.name)?.burnout) : undefined),
        uses: (p as any).uses || 0,
        damageType: p.damageType,
        ability: p.ability,
        linkedPowers: (p as any).linkedPowers || [],
        flaws: p.flaws.map(f => POWER_FLAWS.find(ff => ff.name === f)).filter(Boolean) as PowerModifier[],
        perks: p.perks.map(perk => POWER_PERKS.find(pp => pp.name === perk)).filter(Boolean) as PowerModifier[],
        finalScore: p.finalScore || p.score || 10,
        target: undefined
      }));

      // Determine which creation method was likely used
      const powerNames = loaded.map(p => p.name).sort();
      let detectedMethod: "powerSet" | "array" | "pointBuy" = "pointBuy";
      let detectedSet = "";
      let detectedArray = "";

      // Check power sets
      for (const set of POWER_SETS) {
        const setNames = set.powers.map(sp => sp.name).sort();
        const namesMatch =
          setNames.length === powerNames.length &&
          setNames.every((n, i) => n === powerNames[i]);
        if (!namesMatch) continue;

        const scoresMatch = set.powers.every(sp => {
          const found = loaded.find(lp => lp.name === sp.name);
          return found && found.score === sp.score;
        });

        if (scoresMatch) {
          detectedMethod = "powerSet";
          detectedSet = set.name;
          break;
        }
      }

      // Check power arrays if no set detected
      if (detectedMethod === "pointBuy") {
        for (const arr of POWER_ARRAYS) {
          if (loaded.length !== arr.scores.length) continue;

          const arrCounts: Record<number, number> = {};
          arr.scores.forEach(s => { arrCounts[s] = (arrCounts[s] || 0) + 1; });

          const powerCounts: Record<number, number> = {};
          loaded.forEach(p => { powerCounts[p.score] = (powerCounts[p.score] || 0) + 1; });

          const scoresMatch = Object.keys(arrCounts).every(score => arrCounts[Number(score)] === powerCounts[Number(score)]);

          if (scoresMatch) {
            detectedMethod = "array";
            detectedArray = arr.name;

            // Assign array indexes based on the array ordering
            const remaining = arr.scores.map((score, idx) => ({ score, id: idx }));
            loaded = loaded.map(p => {
              const matchIdx = remaining.findIndex(r => r.score === p.score);
              if (matchIdx >= 0) {
                const id = remaining[matchIdx].id;
                remaining.splice(matchIdx, 1);
                return { ...p, arrayIndex: id };
              }
              return p;
            });
            break;
          }
        }
      }

      if (detectedMethod === "pointBuy") {
        // Calculate remaining points based on loaded powers
        const spent = loaded.reduce((t, pw) => t + getCostForScore(pw.score), 0);
        setAvailablePoints(32 - spent);
      }

      setSelectedPowers(loaded);
      setPowerCreationMethod(detectedMethod);
      if (detectedSet) setSelectedPowerSet(detectedSet);
      if (detectedArray) setSelectedPowerArray(detectedArray);
      setActiveTab("powers");

      if (archetypePowerBonusValue > 0) {
        const bonusPower = loaded.find(p =>
          archetypeTypicalPowers.includes(p.name) && p.finalScore === (p.score || 10) + archetypePowerBonusValue
        );
        if (bonusPower) {
          setArchetypeBonusPower(bonusPower.name);
        }
      }
    }
  }, []);
  
  // Find power sets that match the character's archetype (case-insensitive)
  const eligiblePowerSets = POWER_SETS.filter(set =>
    !set.requiredArchetypes ||
    set.requiredArchetypes.some(
      a => a.toLowerCase() === character.archetype.toLowerCase()
    )
  );

  // Determine if any power sets are available
  const hasPowerSets = eligiblePowerSets.length > 0;
  
  // Update power creation method if current selection is invalid
  useEffect(() => {
    if (powerCreationMethod === "powerSet" && !hasPowerSets) {
      setPowerCreationMethod("array");
    }
  }, [character.archetype, hasPowerSets, powerCreationMethod]);

  // Get the currently selected power set
  const getSelectedPowerSetData = (): PowerSet | undefined => {
    return POWER_SETS.find(set => set.name === selectedPowerSet);
  };

  // Get the currently selected power array
  const getSelectedPowerArrayData = (): number[] => {
    const array = POWER_ARRAYS.find(arr => arr.name === selectedPowerArray);
    return array ? array.scores : [];
  };

  // Get the selected power array with unique indexes
  const getSelectedPowerArrayDataWithIds = (): { score: number; id: number }[] => {
    const array = POWER_ARRAYS.find(arr => arr.name === selectedPowerArray);
    return array ? array.scores.map((score, idx) => ({ score, id: idx })) : [];
  };

  // Count how many times each score has been assigned in array mode
  const assignedScoreCounts: Record<number, number> = {};
  selectedPowers.forEach(p => {
    if (p.score) {
      assignedScoreCounts[p.score] = (assignedScoreCounts[p.score] || 0) + 1;
    }
  });

  // Get the remaining available scores for a power in array mode
  const getAvailableScoresForPower = (powerIndex: number): { score: number; id: number }[] => {
    const arrayScores = [...getSelectedPowerArrayDataWithIds()];

    // Remove scores that are already assigned to other powers based on their id
    selectedPowers.forEach((p, idx) => {
      if (idx !== powerIndex && p.arrayIndex !== undefined) {
        const removeIdx = arrayScores.findIndex(s => s.id === p.arrayIndex);
        if (removeIdx !== -1) {
          arrayScores.splice(removeIdx, 1);
        }
      }
    });

    const currentIndex = selectedPowers[powerIndex]?.arrayIndex;
    if (currentIndex !== undefined && !arrayScores.some(s => s.id === currentIndex)) {
      const original = getSelectedPowerArrayDataWithIds().find(s => s.id === currentIndex);
      if (original) arrayScores.push(original);
    }

    return arrayScores;
  };

  // Get cost for a specific power score
  const getCostForScore = (score: number): number => {
    const costEntry = POWER_COST_TABLE.find(entry => entry.score === score);
    return costEntry ? costEntry.cost : 0;
  };
  
  // Calculate points spent in point buy mode
  const calculatePointsSpent = (): number => {
    return selectedPowers.reduce((total, power) => {
      return total + getCostForScore(power.score);
    }, 0);
  };

  // Add a new power in point buy mode
  const addPower = () => {
    const info: any = powerDataMap.get(ALL_POWERS[0]);
    const newPower: Power = {
      name: ALL_POWERS[0], // Default to the first power in the list
      score: 10,
      arrayIndex: undefined,
      ability: getAbilityOptions(ALL_POWERS[0])[0],
      description: info?.description,
      burnout: info?.burnout ? parseInt(info.burnout) : undefined,
      uses: 0,
      linkedPowers: [],
      flaws: [],
      perks: [],
      finalScore: 10
    };
    
    setSelectedPowers([...selectedPowers, newPower]);
  };

  // Remove a power
  const removePower = (index: number) => {
    const newPowers = [...selectedPowers];
    const removed = newPowers.splice(index, 1)[0];
    newPowers.forEach(p => {
      if (p.linkedPowers) {
        p.linkedPowers = p.linkedPowers.filter(lp => lp !== removed.name);
      }
    });
    setSelectedPowers(newPowers);
  };

  // Update a power's property
  const updatePower = (index: number, field: keyof Power, value: any) => {
    const newPowers = [...selectedPowers];
    const oldName = newPowers[index].name;
    newPowers[index] = { ...newPowers[index], [field]: value };
    
    // Handle changes to power name to determine if damage type should be available
    if (field === 'name') {
      // If the selected power uses damage type, make sure a damage type exists or set default
      if (powerUsesDamageType(value) && !newPowers[index].damageType) {
        newPowers[index].damageType = DAMAGE_TYPES[0];
      }
      // If the power doesn't use damage type, clear any existing damage type
      else if (!powerUsesDamageType(value)) {
        newPowers[index].damageType = undefined;
      }

      const abilityOpts = getAbilityOptions(value);
      if (abilityOpts.length > 0) {
        newPowers[index].ability = abilityOpts[0];
      } else {
        newPowers[index].ability = undefined;
      }

      const info: any = powerDataMap.get(value);
      newPowers[index].description = info?.description;
      newPowers[index].burnout = info?.burnout ? parseInt(info.burnout) : undefined;
      newPowers[index].uses = 0;

      // Update linked references in other powers
      newPowers.forEach((p, idx) => {
        if (idx !== index && p.linkedPowers) {
          p.linkedPowers = p.linkedPowers.map(lp => (lp === oldName ? value : lp));
        }
      });
    }
    
    // Recalculate final score if needed
    if (field === 'score' || field === 'flaws' || field === 'perks') {
      newPowers[index].finalScore = calculateFinalScore(newPowers[index]);
    }
    
    setSelectedPowers(newPowers);
  };

  // Calculate final score after applying modifiers
  const calculateFinalScore = (power: Power): number => {
    const flawBonus = power.flaws.reduce((total, flaw) => total + flaw.bonus, 0);
    const perkPenalty = power.perks.reduce((total, perk) => total + perk.bonus, 0);
    const bonus = power.name === archetypeBonusPower ? archetypePowerBonusValue : 0;

    const cap = getRankCap(character.rank);
    const finalScore = Math.min(power.score + flawBonus + perkPenalty + bonus, cap);

    // Ensure score doesn't go below 10
    return Math.max(finalScore, 10);
  };

  useEffect(() => {
    if (archetypeBonusPower && !selectedPowers.some(p => p.name === archetypeBonusPower)) {
      setArchetypeBonusPower(null);
    }
    setSelectedPowers(prev => prev.map(p => ({ ...p, finalScore: calculateFinalScore(p) })));
  }, [archetypeBonusPower, selectedPowers.length]);

  // Add a modifier to a power
  const togglePowerModifier = (powerIndex: number, modifierType: "flaws" | "perks", modifierName: string) => {
    const newPowers = [...selectedPowers];
    const power = newPowers[powerIndex];
    
    // Get the array of the specific modifier type
    const modifiers = power[modifierType];
    
    // Find if this modifier is already applied
    const modifierList = modifierType === "flaws" ? POWER_FLAWS : POWER_PERKS;
    const modifierData = modifierList.find(m => m.name === modifierName);
    
    if (!modifierData) return;
    
    // Check if already applied
    const modifierIndex = modifiers.findIndex(m => m.name === modifierName);
    
    if (modifierIndex >= 0) {
      // Remove the modifier
      modifiers.splice(modifierIndex, 1);
      if (modifierName === 'Linked') {
        power.linkedPowers = [];
      }
    } else {
      const baseName = modifierName.replace(/\s*\(.*\)/, '').trim();
      const existingIdx = modifiers.findIndex(m => m.name !== modifierName && m.name.replace(/\s*\(.*\)/, '').trim() === baseName);
      if (existingIdx >= 0) {
        modifiers.splice(existingIdx, 1);
      }
      // Add the modifier
      modifiers.push(modifierData);
      if (modifierName === 'Linked' && !power.linkedPowers) {
        power.linkedPowers = [];
      }
    }
    
    // Recalculate final score
    power.finalScore = calculateFinalScore(power);

    setSelectedPowers(newPowers);
  };

  const toggleLinkedPower = (powerIndex: number, linkedName: string, checked: boolean) => {
    const newPowers = [...selectedPowers];
    const links = newPowers[powerIndex].linkedPowers || [];
    if (checked) {
      if (!links.includes(linkedName)) links.push(linkedName);
    } else {
      const idx = links.indexOf(linkedName);
      if (idx >= 0) links.splice(idx, 1);
    }
    newPowers[powerIndex].linkedPowers = links;
    setSelectedPowers(newPowers);
  };

  const changeUses = (index: number, delta: number) => {
    const newPowers = [...selectedPowers];
    const p = newPowers[index];
    p.uses = Math.max(0, (p.uses || 0) + delta);
    setSelectedPowers(newPowers);
  };

  // Handle power set selection
  const handlePowerSetSelection = (powerSetName: string) => {
    setSelectedPowerSet(powerSetName);
    
    const powerSet = POWER_SETS.find(set => set.name === powerSetName);
    if (!powerSet) {
      return;
    }
    
    // Convert power set to powers with initial scores
    const powers = powerSet.powers.map(power => {
      const info: any = powerDataMap.get(power.name);
      return {
        name: power.name,
        score: power.score,
        arrayIndex: undefined,
        ability: getAbilityOptions(power.name)[0],
        description: info?.description,
        burnout: info?.burnout ? parseInt(info.burnout) : undefined,
        uses: 0,
        linkedPowers: [],
        flaws: [],
        perks: [],
        finalScore: power.score,
        damageType: powerUsesDamageType(power.name) ? DAMAGE_TYPES[0] : undefined
      };
    });
    
    setSelectedPowers(powers);
    
    // Update activeTab to "powers" to make sure the UI shows the selected powers
    setActiveTab("powers");
  };

  // Handle power array selection
  const handlePowerArraySelection = (arrayName: string) => {
    setSelectedPowerArray(arrayName);
    
    // Clear any existing powers
    setSelectedPowers([]);
  };
  
  // Add a default power for array mode
  const addDefaultPower = () => {
    const info: any = powerDataMap.get(ALL_POWERS[0]);
    const newPower: Power = {
      name: ALL_POWERS[0], // Default to the first power in the list
      score: 0, // This will be assigned from the array later
      arrayIndex: undefined,
      ability: getAbilityOptions(ALL_POWERS[0])[0],
      description: info?.description,
      burnout: info?.burnout ? parseInt(info.burnout) : undefined,
      uses: 0,
      linkedPowers: [],
      flaws: [],
      perks: [],
      finalScore: 0
    };
    
    setSelectedPowers([...selectedPowers, newPower]);
  };

  // Assign a score from the array to a power
  const assignScoreToPower = (powerIndex: number, arrayId: number) => {
    if (powerCreationMethod !== "array") return;

    const arrayScores = getSelectedPowerArrayDataWithIds();
    const scoreItem = arrayScores.find(s => s.id === arrayId);
    if (!scoreItem) return;

    // Ensure this specific score entry isn't already used by another power
    const alreadyUsed = selectedPowers.some((p, idx) => idx !== powerIndex && p.arrayIndex === arrayId);
    if (alreadyUsed) return;

    const newPowers = [...selectedPowers];
    newPowers[powerIndex] = {
      ...newPowers[powerIndex],
      score: scoreItem.score,
      arrayIndex: arrayId,
      finalScore: calculateFinalScore({ ...newPowers[powerIndex], score: scoreItem.score })
    };

    setSelectedPowers(newPowers);
  };

  // Update power score in point buy mode
  const handleScoreChange = (index: number, increment: boolean) => {
    if (powerCreationMethod !== "pointBuy") return;
    
    const newPowers = [...selectedPowers];
    const power = newPowers[index];
    
    const currentScore = power.score;
    const newScore = increment ? Math.min(currentScore + 1, 20) : Math.max(currentScore - 1, 9);
    
    // Check if we have enough points to make this change
    const currentCost = getCostForScore(currentScore);
    const newCost = getCostForScore(newScore);
    const pointDifference = newCost - currentCost;
    
    const currentPointsSpent = calculatePointsSpent();
    if (increment && currentPointsSpent + pointDifference > 32) {
      // Not enough points
      return;
    }
    
    power.score = newScore;
    power.finalScore = calculateFinalScore(power);
    
    setSelectedPowers(newPowers);
    setAvailablePoints(32 - (currentPointsSpent + pointDifference));
  };

  // Format power name for display
  const formatPowerName = (name: string): string => {
    if (ALL_SKILL_COMPATIBLE.includes(name)) {
      return `${name} (all skill capable)`;
    }
    return name;
  };

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(4);
  };

  // Handle going to next step
  const handleContinue = () => {
    // Convert the selected powers to the format expected by CharacterContext
    const finalPowers = selectedPowers.map(power => ({
      name: power.name,
      description: power.description || "",
      damageType: power.damageType,
      ability: power.ability,
      score: power.score,
      finalScore: power.finalScore,
      burnout: power.burnout,
      uses: power.uses || 0,
      flaws: power.flaws.map(f => f.name),
      perks: power.perks.map(p => p.name),
      linkedPowers: power.linkedPowers || []
    }));
    
    // Update character field with selections
    updateCharacterField('powers', finalPowers);
    updateDerivedStats();
    
    // Track event in analytics
    trackEvent('powers_selected', 'character', 
      `Powers: ${finalPowers.length}, Method: ${powerCreationMethod}`
    );
    
    // Move to the next step
    setCurrentStep(6);
  };

  // Check if user can proceed
  const canProceed = () => {
    // Must have at least one power
    if (selectedPowers.length === 0) return false;
    
    // All powers must have names
    if (selectedPowers.some(p => !p.name)) return false;
    
    // In array mode, all powers must have scores assigned
    if (powerCreationMethod === "array") {
      const arrayScores = getSelectedPowerArrayDataWithIds();

      if (selectedPowers.length !== arrayScores.length) return false;

      // Ensure every score id is used exactly once
      const usedIds = selectedPowers.map(p => p.arrayIndex);
      if (usedIds.some(id => id === undefined)) return false;

      const allUsed = arrayScores.every(score => usedIds.includes(score.id));
      if (!allUsed) return false;
    }
    
    // In point buy mode, must be within point budget
    if (powerCreationMethod === "pointBuy" && calculatePointsSpent() > 32) {
      return false;
    }

    if (archetypePowerBonusValue > 0 && eligibleBonusPowers.length > 0 && !archetypeBonusPower) {
      return false;
    }

    return true;
  };

  return (
    <motion.div 
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-display text-3xl text-red-500 tracking-wide">Step 5: Powers</h2>
        <p className="text-gray-300 mt-2">
          Powers are extraordinary abilities that set heroes apart from regular folk. Choose your powers and their strength.
        </p>
      </div>

      <div className="space-y-6">
        {/* Power Creation Method Selection */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-medium text-lg mb-3">Choose Power Creation Method</h3>
          
          <RadioGroup 
            value={powerCreationMethod}
            onValueChange={(value) => setPowerCreationMethod(value as any)}
            className="flex flex-col gap-4"
          >
            {hasPowerSets && (
              <div className="flex items-start gap-2">
                <RadioGroupItem value="powerSet" id="powerSet" />
                <div>
                  <Label htmlFor="powerSet" className="font-medium">Power Set</Label>
                  <p className="text-sm text-gray-400">Choose a themed collection of powers aligned with your archetype.</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <RadioGroupItem value="array" id="array" />
              <div>
                <Label htmlFor="array" className="font-medium">Power Score Array</Label>
                <p className="text-sm text-gray-400">Choose an array of power scores and assign them to powers of your choice.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <RadioGroupItem value="pointBuy" id="pointBuy" />
              <div>
                <Label htmlFor="pointBuy" className="font-medium">Point Buy</Label>
                <p className="text-sm text-gray-400">Customize your powers using 32 points to buy power scores.</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Power Set Selection (if applicable) */}
        {powerCreationMethod === "powerSet" && hasPowerSets && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-comic text-xl mb-3">
              {selectedPowerSet ? `Power Set Selected` : `Select a Power Set`}
            </h3>
            {!selectedPowerSet && character.archetype && (
              <div className="mb-4 p-3 bg-gray-700 rounded-md">
                <p className="text-sm">Power sets available for your <span className="font-bold text-accent">{character.archetype}</span> archetype:</p>
                <div className="mt-2">
                  {eligiblePowerSets.filter(set => set.requiredArchetypes?.includes(character.archetype)).map(set => (
                    <span key={set.name} className="inline-block mr-2 mb-2 px-2 py-1 bg-accent/20 text-accent text-sm rounded-full">{set.name}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedPowerSet ? (
              <div className="bg-accent/10 border border-accent rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-comic text-lg text-accent">{selectedPowerSet} Power Set</h4>
                    {character.archetype && (
                      <p className="text-xs text-accent/70 mt-1">
                        {POWER_SETS.find(set => set.name === selectedPowerSet)?.requiredArchetypes?.includes(character.archetype) 
                          ? `Specialized for ${character.archetype} archetype` 
                          : 'Available to all archetypes'}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPowerSet("");
                      setSelectedPowers([]);
                    }}
                  >
                    Change
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm mb-1">Your powers with this set:</p>
                  {selectedPowers.map((power, idx) => (
                    <div key={`selected-power-${idx}`} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                      <span className="text-red-500 font-comic-light">{power.name}</span>
                      <span className="font-bold text-accent">{power.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eligiblePowerSets.map(powerSet => (
                  <div
                    key={powerSet.name}
                    className="border rounded-lg p-3 cursor-pointer bg-gray-700 border-gray-600 hover:border-gray-500"
                    onClick={() => handlePowerSetSelection(powerSet.name)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{powerSet.name}</h4>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {powerSet.powers.map((power, idx) => (
                          <div key={`${power.name}-${idx}`} className="flex items-center">
                            <span className="bg-gray-900 px-2 py-0.5 rounded-full text-xs mr-1">
                              <span className="text-red-500 font-comic-light">{power.name}</span>
                            </span>
                            <span className="text-accent text-xs">{power.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Power Array Selection */}
        {powerCreationMethod === "array" && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-medium text-lg mb-3">Select a Power Score Array</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POWER_ARRAYS.map(array => (
                <div
                  key={array.name}
                  className={`
                    border rounded-lg p-3 cursor-pointer
                    ${selectedPowerArray === array.name 
                      ? 'bg-accent/10 border-accent' 
                      : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handlePowerArraySelection(array.name)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{array.name}</h4>
                    {selectedPowerArray === array.name && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {array.scores.map(score => (
                      <span key={score} className="bg-gray-900 text-accent px-2 py-0.5 rounded-full text-sm">
                        {score}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Point Buy Information */}
        {powerCreationMethod === "pointBuy" && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Point Buy</h3>
              <div className="flex items-center px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 shadow-md">
                <span className="text-gray-400">Points Available: </span>
                <span className={`${availablePoints < 0 ? 'text-red-500' : 'text-accent'}`}>
                  {availablePoints}
                </span>
                <span className="text-gray-400"> / 32</span>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 mb-3">
              {POWER_COST_TABLE.map(entry => (
                <div key={entry.score} className="bg-gray-700 p-1 rounded text-center text-xs">
                  <div className="text-gray-300">{entry.score}</div>
                  <div className="text-accent">{entry.cost} pts</div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addPower}
              className="mt-2"
              disabled={selectedPowers.length >= 5}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Power
            </Button>
          </div>
        )}

        {/* Powers Tab Interface */}
        <Tabs defaultValue="powers" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-1">
            <TabsTrigger value="powers">Powers</TabsTrigger>
          </TabsList>
          
          {/* Powers Tab */}
          <TabsContent value="powers" className="space-y-4 mt-4">
            {powerCreationMethod === "powerSet" && selectedPowerSet && (
              <>
                <div className="space-y-4">
                  {selectedPowers.map((power, index) => {
                    const data = getScoreData(power.finalScore);
                    return (
                      <div
                        key={index}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-red-500">{formatPowerName(power.name)}</div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">Score:</span>
                          <span className="text-accent">{power.score}</span>
                          {power.finalScore !== power.score && (
                            <span className="text-green-400 ml-1">→ {power.finalScore}</span>
                          )}
                        </div>
                      </div>
                    
                    {power.damageType !== undefined && (
                      <div className="mt-2">
                        <Label className="text-sm">Damage Type</Label>
                        <Select
                          value={power.damageType}
                          onValueChange={(value) => updatePower(index, 'damageType', value)}
                        >
                          <SelectTrigger className="bg-gray-800">
                            <SelectValue placeholder="Select damage type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAMAGE_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {getAbilityOptions(power.name).length > 0 && (
                      <div className="mt-2">
                        <Label className="text-sm">Ability</Label>
                        <Select
                          value={power.ability}
                          onValueChange={(value) => updatePower(index, 'ability', value)}
                        >
                          <SelectTrigger className="bg-gray-800">
                            <SelectValue placeholder="Select ability" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAbilityOptions(power.name).map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Burnout {power.burnout ?? 0}</span>
                      <Button variant="outline" size="sm" onClick={() => changeUses(index, -1)} disabled={(power.uses || 0) <= 0}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{power.uses || 0}</span>
                      <Button variant="outline" size="sm" onClick={() => changeUses(index, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Display applied modifiers */}
                    {(power.flaws.length > 0 || power.perks.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        {power.flaws.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-400 font-comic-light">Applied Flaws:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {power.flaws.map(flaw => (
                                <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs font-comic-light">
                                  {flaw.name} (+{flaw.bonus})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {power.perks.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-400 font-comic-light">Applied Perks:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {power.perks.map(perk => (
                                <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs font-comic-light">
                                  {perk.name} ({perk.bonus})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                    {power.flaws.some(f => f.name === 'Linked') && selectedPowers.length > 1 && (
                          <div className="mt-2 space-y-1">
                            <Label className="text-xs">Linked To</Label>
                            {selectedPowers.map((p, idx) => (
                              index !== idx && (
                                <div key={`linked-${index}-${idx}`} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`linked-${index}-${idx}`}
                                    checked={power.linkedPowers?.includes(p.name) || false}
                                    onCheckedChange={(checked) => toggleLinkedPower(index, p.name, !!checked)}
                                  />
                                  <Label htmlFor={`linked-${index}-${idx}`} className="text-xs">{p.name}</Label>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {power.finalScore !== power.score && (
                      <div className="text-base text-green-400 mt-3 font-comic-light">
                        Final Score: {power.finalScore} (Die: {data.baseDie || "-"} {formatModifier(data.modifier)} | Range: {data.powerRange}
                        {data.maxLift && ` | Max Lift: ${data.maxLift}`}
                        {data.topMPH && data.topMPH !== '-' && ` | Top MPH: ${data.topMPH}`})
                      </div>
                    )}
                  </div>
                    );})}
                </div>
                <div className="mt-4 text-sm">Total Burnout: {totalBurnout} / {character.burnoutThreshold}</div>
              </>
            )}
            
            {powerCreationMethod === "array" && selectedPowerArray && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <h3 className="font-medium mb-2">Selected Array: {selectedPowerArray}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(() => {
                      const usageTracker: Record<number, number> = {};
                      return getSelectedPowerArrayData().map((score, idx) => {
                        usageTracker[score] = (usageTracker[score] || 0) + 1;
                        const used = usageTracker[score] <= (assignedScoreCounts[score] || 0);
                        return (
                          <div
                            key={`array-score-display-${selectedPowerArray}-${score}-${idx}`}
                            className={`
                              p-2 rounded-md text-center min-w-[40px]
                              ${used ? 'bg-gray-600 text-gray-400' : 'bg-accent text-white'}
                            `}
                          >
                            {score}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Your Powers</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addDefaultPower}
                      disabled={selectedPowers.length >= getSelectedPowerArrayData().length}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Power
                    </Button>
                  </div>
                  
                  {selectedPowers.map((power, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-800 rounded-lg border border-gray-700 mt-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <div className="flex justify-between mb-2">
                            <div className="w-4/5">
                              <Select
                                value={power.name}
                                onValueChange={(value) => updatePower(index, 'name', value)}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Select a power" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {ALL_POWERS.map(powerName => (
                                    <SelectItem key={powerName} value={powerName}>
                                      <span className="text-red-500">{powerName}</span>{ALL_SKILL_COMPATIBLE.includes(powerName) && " (all skill capable)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removePower(index)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 mb-2">
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">Power Score</Label>
                              <Select
                                value={power.arrayIndex !== undefined ? `${power.arrayIndex}` : ""}
                                onValueChange={(value) => assignScoreToPower(index, parseInt(value))}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Select score" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableScoresForPower(index).map(({ score, id }) => (
                                    <SelectItem
                                      key={`array-score-${id}`}
                                      value={`${id}`}
                                    >
                                      {score}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {getAbilityOptions(power.name).length > 0 && (
                              <div className="flex-1">
                                <Label className="text-xs mb-1 block">Ability</Label>
                                <Select
                                  value={power.ability}
                                  onValueChange={(value) => updatePower(index, 'ability', value)}
                                >
                                  <SelectTrigger className="bg-gray-800">
                                    <SelectValue placeholder="Select ability" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAbilityOptions(power.name).map(opt => (
                                      <SelectItem key={`ability-${opt}`} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {/* Only show damage type selector for powers that need it */}
                            {powerUsesDamageType(power.name) && (
                              <div className="flex-1">
                                <Label className="text-xs mb-1 block">Damage Type</Label>
                                <Select
                                  value={power.damageType || "none"}
                                  onValueChange={(value) => updatePower(index, 'damageType', value === "none" ? undefined : value)}
                                >
                                  <SelectTrigger className="bg-gray-800">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {DAMAGE_TYPES.map(type => (
                                      <SelectItem key={`damage-${type}`} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          
                          {/* Add power modification dropdowns */}
                          <div className="mt-3 pt-3 border-t border-gray-600 grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs mb-1 block">Add Flaw</Label>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  if (value) {
                                    const flaw = POWER_FLAWS.find(f => f.name === value);
                                    if (flaw && !power.flaws.some(f => f.name === flaw.name)) {
                                      togglePowerModifier(index, "flaws", flaw.name);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Add a flaw" />
                                </SelectTrigger>
                                <SelectContent>
                                  {POWER_FLAWS.map(flaw => (
                                    <SelectItem 
                                      key={`flaw-option-${flaw.name}`} 
                                      value={flaw.name}
                                      disabled={power.flaws.some(f => f.name === flaw.name)}
                                    >
                                      {flaw.name} (+{flaw.bonus})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-xs mb-1 block">Add Perk</Label>
                              <Select
                                value=""
                                onValueChange={(value) => {
                                  if (value) {
                                    const perk = POWER_PERKS.find(p => p.name === value);
                                    if (perk && !power.perks.some(p => p.name === perk.name)) {
                                      togglePowerModifier(index, "perks", perk.name);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Add a perk" />
                                </SelectTrigger>
                                <SelectContent>
                                  {POWER_PERKS.filter(perk =>
                                    perk.name !== "All Skill" || ALL_SKILL_COMPATIBLE.includes(power.name)
                                  ).map(perk => (
                                    <SelectItem
                                      key={`perk-option-${perk.name}`}
                                      value={perk.name}
                                      disabled={power.perks.some(p => p.name === perk.name)}
                                    >
                                      {perk.name} ({perk.bonus})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Display applied modifiers */}
                          {(power.flaws.length > 0 || power.perks.length > 0) && (
                            <div className="mt-3">
                              {power.flaws.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs text-gray-400 font-comic-light">Applied Flaws:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {power.flaws.map(flaw => (
                                      <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center font-comic-light">
                                        {flaw.name} (+{flaw.bonus})
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 p-0 ml-1"
                                          onClick={() => togglePowerModifier(index, "flaws", flaw.name)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {power.perks.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 font-comic-light">Applied Perks:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                              {power.perks.map(perk => (
                                <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center font-comic-light">
                                  {perk.name} ({perk.bonus})
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => togglePowerModifier(index, "perks", perk.name)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {power.flaws.some(f => f.name === 'Linked') && selectedPowers.length > 1 && (
                          <div className="mt-2 space-y-1">
                            <Label className="text-xs">Linked To</Label>
                            {selectedPowers.map((p, idx) => (
                              index !== idx && (
                                <div key={`linked-array-${index}-${idx}`} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`linked-array-${index}-${idx}`}
                                    checked={power.linkedPowers?.includes(p.name) || false}
                                    onCheckedChange={(checked) => toggleLinkedPower(index, p.name, !!checked)}
                                  />
                                  <Label htmlFor={`linked-array-${index}-${idx}`} className="text-xs">{p.name}</Label>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                        {/* Display final score if it differs */}
                        {power.finalScore !== power.score && (() => {
                          const data = getScoreData(power.finalScore);
                          return (
                            <div className="text-base text-green-400 mt-3 font-comic-light">
                              Final Score: {power.finalScore} (Die: {data.baseDie || "-"} {formatModifier(data.modifier)} | Range: {data.powerRange}
                              {data.maxLift && ` | Max Lift: ${data.maxLift}`}
                              {data.topMPH && data.topMPH !== '-' && ` | Top MPH: ${data.topMPH}`})
                            </div>
                          );
                        })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {powerCreationMethod === "pointBuy" && (
              <div className="space-y-4">
                {selectedPowers.map((power, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex justify-between mb-3">
                          <Select
                            value={power.name}
                            onValueChange={(value) => updatePower(index, 'name', value)}
                          >
                            <SelectTrigger className="bg-gray-800">
                              <SelectValue placeholder="Select a power" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {ALL_POWERS.map(powerName => (
                                <SelectItem key={powerName} value={powerName}>
                                  <span className="text-red-500">{powerName}</span>{ALL_SKILL_COMPATIBLE.includes(powerName) && " (all skill capable)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removePower(index)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                          <div>
                            <Label className="text-xs mb-1 block">Power Score</Label>
                            <div className="flex items-center">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleScoreChange(index, false)}
                                disabled={power.score <= 9}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <div className="mx-2 min-w-[60px] text-center">
                                <span className="text-lg font-bold">{power.score}</span>
                                <span className="text-xs text-gray-400 block">
                                  ({getCostForScore(power.score)} pts)
                                </span>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleScoreChange(index, true)}
                                disabled={power.score >= 20 || availablePoints < (getCostForScore(power.score + 1) - getCostForScore(power.score))}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {getAbilityOptions(power.name).length > 0 && (
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">Ability</Label>
                              <Select
                                value={power.ability}
                                onValueChange={(value) => updatePower(index, 'ability', value)}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Select ability" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAbilityOptions(power.name).map(opt => (
                                    <SelectItem key={`pb-ability-${opt}`} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {powerUsesDamageType(power.name) && (
                            <div className="flex-1">
                              <Label className="text-xs mb-1 block">Damage Type</Label>
                              <Select
                                value={power.damageType || "none"}
                                onValueChange={(value) => updatePower(index, 'damageType', value === "none" ? undefined : value)}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {DAMAGE_TYPES.map(type => (
                                    <SelectItem key={`point-buy-${type}`} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Add power modification dropdowns */}
                        <div className="mt-3 pt-3 border-t border-gray-600 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs mb-1 block">Add Flaw</Label>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value) {
                                  const flaw = POWER_FLAWS.find(f => f.name === value);
                                  if (flaw && !power.flaws.some(f => f.name === flaw.name)) {
                                    togglePowerModifier(index, "flaws", flaw.name);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-800">
                                <SelectValue placeholder="Add a flaw" />
                              </SelectTrigger>
                              <SelectContent>
                                {POWER_FLAWS.map(flaw => (
                                  <SelectItem
                                    key={`pb-flaw-option-${flaw.name}`}
                                    value={flaw.name}
                                    disabled={power.flaws.some(f => f.name === flaw.name)}
                                  >
                                    {flaw.name} (+{flaw.bonus})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs mb-1 block">Add Perk</Label>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value) {
                                  const perk = POWER_PERKS.find(p => p.name === value);
                                  if (perk && !power.perks.some(p => p.name === perk.name)) {
                                    togglePowerModifier(index, "perks", perk.name);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="bg-gray-800">
                                <SelectValue placeholder="Add a perk" />
                              </SelectTrigger>
                              <SelectContent>
                                {POWER_PERKS.filter(perk =>
                                  perk.name !== "All Skill" || ALL_SKILL_COMPATIBLE.includes(power.name)
                                ).map(perk => (
                                  <SelectItem
                                    key={`pb-perk-option-${perk.name}`}
                                    value={perk.name}
                                    disabled={power.perks.some(p => p.name === perk.name)}
                                  >
                                    {perk.name} ({perk.bonus})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Display final score if it differs */}
                        {power.finalScore !== power.score && (() => {
                          const data = getScoreData(power.finalScore);
                          return (
                            <div className="text-base text-green-400 mt-2 font-comic-light">
                              Final Score: {power.finalScore} (Die: {data.baseDie || "-"} {formatModifier(data.modifier)} | Range: {data.powerRange}
                              {data.maxLift && ` | Max Lift: ${data.maxLift}`}
                              {data.topMPH && data.topMPH !== '-' && ` | Top MPH: ${data.topMPH}`})
                            </div>
                          );
                        })()}
                        
                        {/* Display applied modifiers */}
                        {(power.flaws.length > 0 || power.perks.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            {power.flaws.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-400">Flaws:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {power.flaws.map(flaw => (
                                    <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center font-comic-light">
                                      {flaw.name} (+{flaw.bonus})
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => togglePowerModifier(index, "flaws", flaw.name)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {power.perks.length > 0 && (
                              <div>
                                <span className="text-xs text-gray-400">Perks:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {power.perks.map(perk => (
                                  <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center font-comic-light">
                                    {perk.name} ({perk.bonus})
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 p-0 ml-1"
                                      onClick={() => togglePowerModifier(index, "perks", perk.name)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {power.flaws.some(f => f.name === 'Linked') && selectedPowers.length > 1 && (
                            <div className="mt-2 space-y-1">
                              <Label className="text-xs">Linked To</Label>
                              {selectedPowers.map((p, idx) => (
                                index !== idx && (
                                  <div key={`linked-pb-${index}-${idx}`} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`linked-pb-${index}-${idx}`}
                                      checked={power.linkedPowers?.includes(p.name) || false}
                                      onCheckedChange={(checked) => toggleLinkedPower(index, p.name, !!checked)}
                                    />
                                    <Label htmlFor={`linked-pb-${index}-${idx}`} className="text-xs">{p.name}</Label>
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
        </Tabs>

        {archetypePowerBonusValue > 0 && eligibleBonusPowers.length > 0 && (
          <div className="mt-8 pt-4 border-t-2 border-gray-700">
            <Label className="text-sm mb-2 block">
              Archetype Power Bonus (+{archetypePowerBonusValue})
            </Label>
            <Select
              value={archetypeBonusPower || ""}
              onValueChange={(value) => setArchetypeBonusPower(value)}
            >
              <SelectTrigger className="w-[240px] bg-gray-800">
                <SelectValue placeholder="Select a power" />
              </SelectTrigger>
              <SelectContent>
                {eligibleBonusPowers.map(p => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t-2 border-gray-700">
          <Button
            type="button"
            className="px-6 py-3 rounded-lg bg-gray-700 font-comic text-white hover:bg-gray-600 transition-colors"
            onClick={handlePrevious}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          <Button 
            type="button"
            className="px-6 py-3 rounded-lg bg-accent font-comic text-white hover:bg-red-700 transition-colors shadow-lg"
            onClick={handleContinue}
            disabled={!canProceed()}
          >
            Next <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
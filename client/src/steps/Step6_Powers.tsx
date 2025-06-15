import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, Check, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";

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
  description?: string;
  damageType?: string;
  target?: string;
  flaws: PowerModifier[];
  perks: PowerModifier[];
  finalScore: number;
}

// Power modifier interface
interface PowerModifier {
  name: string;
  description: string;
  bonus: number;
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

// Define the available power sets based on the rulebook
const POWER_SETS: PowerSet[] = [
  {
    name: "Andromorph",
    powers: [
      { name: "Bestial Transformation", score: 16 },
      { name: "Communicate with Animals", score: 12 },
      { name: "Enhanced Attack", score: 16 },
      { name: "Enhanced Ability Score (Strength or Dexterity)", score: 14 },
      { name: "Enhanced Sense", score: 12 }
    ],
    requiredArchetypes: ["Shapeshifter"]
  },
  {
    name: "Blaster",
    powers: [
      { name: "Energy Blast", score: 16 },
      { name: "Energy Generation", score: 12 },
      { name: "Energy Explosion", score: 14 },
      { name: "Energy Sheath", score: 16 },
      { name: "Flight", score: 12 }
    ],
    requiredArchetypes: ["Blaster", "Speedster"]
  },
  {
    name: "Brawler",
    powers: [
      { name: "Enhanced Attack", score: 16 },
      { name: "Enhanced Ability Score (Strength or Dexterity)", score: 16 },
      { name: "Enhanced Ability Score (Constitution)", score: 12 },
      { name: "Regeneration", score: 14 },
      { name: "Super-Sense", score: 12 }
    ],
    requiredArchetypes: ["Bruiser", "Speedster"]
  },
  {
    name: "Controller",
    powers: [
      { name: "Telepathy", score: 12 },
      { name: "Emotion Control", score: 12 },
      { name: "Mind Control", score: 16 },
      { name: "Move Object", score: 16 },
      { name: "Sympathy", score: 14 }
    ],
    requiredArchetypes: ["Mentalist", "Mastermind"]
  },
  {
    name: "Infiltrator",
    powers: [
      { name: "Adoptive Muscle Memory", score: 16 },
      { name: "Enhanced Sense", score: 14 },
      { name: "Invisibility", score: 16 },
      { name: "Luck", score: 12 },
      { name: "Swinging", score: 12 }
    ],
    requiredArchetypes: ["Gadgeteer", "Shapeshifter"]
  },
  {
    name: "Heavy",
    powers: [
      { name: "Armor", score: 16 },
      { name: "Enhanced Attack", score: 12 },
      { name: "Enhanced Ability Score (Strength)", score: 14 },
      { name: "Enhanced Ability Score (Constitution)", score: 16 },
      { name: "Resistance", score: 12 }
    ],
    requiredArchetypes: ["Bruiser", "Defender"]
  },
  {
    name: "Transporter",
    powers: [
      { name: "Celerity", score: 16 },
      { name: "Enhanced Ability Score (Dexterity)", score: 14 },
      { name: "Speed", score: 16 },
      { name: "Surge", score: 14 },
      { name: "Temporal Fugue", score: 12 }
    ],
    requiredArchetypes: ["Speedster", "Transporter"]
  }
];

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
const ALL_POWERS = [
  "Aquatic Adaptation",
  "Adsorb Energy",
  "Adsorb Matter",
  "Adoptive Muscle Memory",
  "Animate Object",
  "Armor",
  "Bestial Transformation",
  "Botanokinesis",
  "Broadcast",
  "Catfall",
  "Celerity",
  "Chameleon",
  "Communicate with Animals",
  "Communicate with Plants",
  "Control Weather",
  "Convert Matter",
  "Damaging Form",
  "Darkness",
  "Defection",
  "Density Control",
  "Duplicate",
  "Dynamic Power",
  "Eidetic Memory",
  "Elasticity",
  "Energy Blast",
  "Energy Explosion",
  "Energy Generation",
  "Energy Manipulation",
  "Energy Sheath",
  "Emotion Control",
  "Endurance",
  "Enhanced Attack",
  "Enhanced Ability Score",
  "Enhanced Sense",
  "Entangle",
  "Flight",
  "Force Field",
  "Force Field, Personal",
  "Force Shield",
  "Free Consciousness",
  "Geospatial Shift",
  "Gravity Control",
  "Growth",
  "Glide",
  "Heal",
  "Imbue Consciousness",
  "Incorporeal",
  "Inventive Gadgetry",
  "Invisibility",
  "Invulnerability",
  "Life Support",
  "Luck",
  "Manifest Gear",
  "Mimic",
  "Mind Control",
  "Move Object",
  "Multiple Limbs",
  "Nullify",
  "Portal",
  "Poison",
  "Possession",
  "Psychic Attack",
  "Power Boost",
  "Regeneration",
  "Resistance",
  "Shapeshift",
  "Shrink",
  "Sixth Sense",
  "Speed",
  "Summon Animal",
  "Super-Sense",
  "Surge",
  "Swinging",
  "Sympathy",
  "Telepathy",
  "Teleport",
  "Temporal Fugue",
  "Tracking",
  "Tunnel",
  "Weaken",
  "Wall Crawl",
  "Wireless",
  "Weird Biology"
];

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

// Power Flaws from the list
const POWER_FLAWS: PowerModifier[] = [
  { name: "Conditional", description: "Power only works under specific conditions", bonus: 4 },
  { name: "Cybernetic Implant", description: "Power comes from cybernetic enhancements", bonus: 2 },
  { name: "External Power Source", description: "Power requires an external source to function", bonus: 0 },
  { name: "Fatiguing", description: "Using the power causes fatigue", bonus: 4 },
  { name: "Limitation (Minor)", description: "Power has a minor limitation in how it can be used", bonus: 2 },
  { name: "Limitation (Moderate)", description: "Power has a moderate limitation in how it can be used", bonus: 3 },
  { name: "Limitation (Major)", description: "Power has a major limitation in how it can be used", bonus: 4 },
  { name: "Limited Uses (Few)", description: "Power can only be used a few times", bonus: 2 },
  { name: "Limited Uses (Very Few)", description: "Power can only be used very few times", bonus: 4 },
  { name: "Linked", description: "Power is linked to another power", bonus: 2 },
  { name: "Power Armor", description: "Power is derived from powered armor", bonus: 4 },
  { name: "Removable Item (Standard)", description: "Power is tied to an item that can be taken away", bonus: 2 },
  { name: "Removable Item (Difficult)", description: "Power is tied to an item that is difficult to remove", bonus: 4 },
  { name: "Slow (Moderately)", description: "Power takes extra time to activate", bonus: 2 },
  { name: "Slow (Significantly)", description: "Power takes significant time to activate", bonus: 4 },
  { name: "Trigger", description: "Power requires a specific trigger to activate", bonus: 2 },
  { name: "Unpowered Form", description: "Requires a transformation to access your powers", bonus: 2 },
  { name: "Unreliable", description: "Power doesn't always work as expected", bonus: 4 }
];

// Power Perks from the list
const POWER_PERKS: PowerModifier[] = [
  { name: "Accurate", description: "Power is exceptionally accurate", bonus: -4 },
  { name: "All Skill", description: "Power can be used with any skill", bonus: 0 },
  { name: "Efficient Power", description: "Power uses less energy or resources", bonus: -2 },
  { name: "Penetrating", description: "Power can penetrate defenses more effectively", bonus: -2 },
  { name: "Secondary Effect (Minor)", description: "Power has a minor additional effect", bonus: -2 },
  { name: "Secondary Effect (Major)", description: "Power has a major additional effect", bonus: -4 }
];

// Available damage types
const DAMAGE_TYPES = [
  "Kinetic", "Fire", "Cold", "Electrical", "Acid", "Sonic", 
  "Light", "Radiation", "Dark", "Force", "Psychic"
];

export default function Step6_Powers() {
  const { character, updateCharacterField, setCurrentStep, setCurrentSubStep } = useCharacter();
  const [powerCreationMethod, setPowerCreationMethod] = useState<"powerSet" | "array" | "pointBuy">("powerSet");
  const [selectedPowerSet, setSelectedPowerSet] = useState<string>("");
  const [selectedPowerArray, setSelectedPowerArray] = useState<string>("");
  const [availablePoints, setAvailablePoints] = useState<number>(32);
  const [selectedPowers, setSelectedPowers] = useState<Power[]>([]);
  const [activeTab, setActiveTab] = useState<string>("powers");
  
  // Find eligible power sets based on character's archetype
  const eligiblePowerSets = POWER_SETS.filter(set => 
    !set.requiredArchetypes || set.requiredArchetypes.includes(character.archetype)
  );

  // We'll always have power sets available with the generic ones
  const hasPowerSets = true;
  
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
    const newPower: Power = {
      name: ALL_POWERS[0], // Default to the first power in the list
      score: 10,
      flaws: [],
      perks: [],
      finalScore: 10
    };
    
    setSelectedPowers([...selectedPowers, newPower]);
  };

  // Remove a power
  const removePower = (index: number) => {
    const newPowers = [...selectedPowers];
    newPowers.splice(index, 1);
    setSelectedPowers(newPowers);
  };

  // Update a power's property
  const updatePower = (index: number, field: keyof Power, value: any) => {
    const newPowers = [...selectedPowers];
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
    
    // Cap at 20 for B-Lister rank
    const finalScore = Math.min(power.score + flawBonus + perkPenalty, 20);
    
    // Ensure score doesn't go below 10
    return Math.max(finalScore, 10);
  };

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
    } else {
      // Add the modifier
      modifiers.push(modifierData);
    }
    
    // Recalculate final score
    power.finalScore = calculateFinalScore(power);
    
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
    const powers = powerSet.powers.map(power => ({
      name: power.name,
      score: power.score,
      flaws: [],
      perks: [],
      finalScore: power.score,
      damageType: powerUsesDamageType(power.name) ? DAMAGE_TYPES[0] : undefined
    }));
    
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
    const newPower: Power = {
      name: ALL_POWERS[0], // Default to the first power in the list
      score: 0, // This will be assigned from the array later
      flaws: [],
      perks: [],
      finalScore: 0
    };
    
    setSelectedPowers([...selectedPowers, newPower]);
  };

  // Assign a score from the array to a power
  const assignScoreToPower = (powerIndex: number, score: number) => {
    if (powerCreationMethod !== "array") return;

    const arrayScores = getSelectedPowerArrayData();
    const allowedCount = arrayScores.filter(s => s === score).length;
    const alreadyAssigned = selectedPowers.filter((p, idx) => idx !== powerIndex && p.score === score).length;

    if (alreadyAssigned >= allowedCount) return;

    const newPowers = [...selectedPowers];
    newPowers[powerIndex] = {
      ...newPowers[powerIndex],
      score,
      finalScore: calculateFinalScore({ ...newPowers[powerIndex], score })
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
    return name;
  };

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(5);
    setCurrentSubStep(1);
  };

  // Handle going to next step
  const handleContinue = () => {
    // Convert the selected powers to the format expected by CharacterContext
    const finalPowers = selectedPowers.map(power => ({
      name: power.name,
      description: power.description || "",
      damageType: power.damageType,
      score: power.score,
      finalScore: power.finalScore,
      flaws: power.flaws.map(f => f.name),
      perks: power.perks.map(p => p.name)
    }));
    
    // Update character field with selections
    updateCharacterField('powers', finalPowers);
    
    // Track event in analytics
    trackEvent('powers_selected', 'character', 
      `Powers: ${finalPowers.length}, Method: ${powerCreationMethod}`
    );
    
    // Move to the next step
    setCurrentStep(7);
  };

  // Check if user can proceed
  const canProceed = () => {
    // Must have at least one power
    if (selectedPowers.length === 0) return false;
    
    // All powers must have names
    if (selectedPowers.some(p => !p.name)) return false;
    
    // In array mode, all powers must have scores assigned
    if (powerCreationMethod === "array") {
      const arrayScores = getSelectedPowerArrayData();
      // Check if we have the right number of powers for this array
      if (selectedPowers.length !== arrayScores.length) return false;
      
      // Check if all scores from the array are assigned
      const usedScores = selectedPowers.map(p => p.score);
      const allScoresAssigned = arrayScores.every(score => usedScores.includes(score));
      if (!allScoresAssigned) return false;
    }
    
    // In point buy mode, must be within point budget
    if (powerCreationMethod === "pointBuy" && calculatePointsSpent() > 32) {
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
        <h2 className="font-display text-3xl text-red-500 tracking-wide">Step 6: Powers</h2>
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
              <div className="space-y-4">
                {selectedPowers.map((power, index) => (
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
                    
                    {/* Display applied modifiers */}
                    {(power.flaws.length > 0 || power.perks.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        {power.flaws.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-400">Flaws:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {power.flaws.map(flaw => (
                                <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs">
                                  {flaw.name} (+{flaw.bonus})
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
                                <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs">
                                  {perk.name} ({perk.bonus})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {powerCreationMethod === "array" && selectedPowerArray && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <h3 className="font-medium mb-2">Selected Array: {selectedPowerArray}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getSelectedPowerArrayData().map((score, idx) => (
                      <div 
                        key={`array-score-display-${selectedPowerArray}-${score}-${idx}`}
                        className={`
                          p-2 rounded-md text-center min-w-[40px]
                          ${selectedPowers.some(p => p.score === score) 
                            ? 'bg-gray-600 text-gray-400' 
                            : 'bg-accent text-white'
                          }
                        `}
                      >
                        {score}
                      </div>
                    ))}
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
                                      <span className="text-red-500">{powerName}</span>{ALL_SKILL_COMPATIBLE.includes(powerName) && " *"}
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
                                value={power.score ? `${power.score}-${index}` : ""}
                                onValueChange={(value) => assignScoreToPower(index, parseInt(value))}
                              >
                                <SelectTrigger className="bg-gray-800">
                                  <SelectValue placeholder="Select score" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getSelectedPowerArrayData().map((score, idx) => (
                                    <SelectItem
                                      key={`array-score-${score}-${idx}-${index}`}
                                      value={`${score}-${idx}`}
                                      disabled={
                                        selectedPowers.filter((p, i) => i !== index && p.score === score).length >=
                                        getSelectedPowerArrayData().filter(s => s === score).length
                                      }
                                    >
                                      {score}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
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
                                  <span className="text-xs text-gray-400">Applied Flaws:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {power.flaws.map(flaw => (
                                      <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center">
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
                                  <span className="text-xs text-gray-400">Applied Perks:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {power.perks.map(perk => (
                                      <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
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
                            </div>
                          )}

                          {/* Display final score if it differs */}
                          {power.finalScore !== power.score && (
                            <div className="text-sm text-green-400 mt-3">
                              Final Score: {power.finalScore} (after modifiers)
                            </div>
                          )}
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
                                  <span className="text-red-500">{powerName}</span>{ALL_SKILL_COMPATIBLE.includes(powerName) && " *"}
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
                        
                        {/* Display final score if it differs */}
                        {power.finalScore !== power.score && (
                          <div className="text-sm text-green-400 mt-2">
                            Final Score: {power.finalScore} (after modifiers)
                          </div>
                        )}
                        
                        {/* Display applied modifiers */}
                        {(power.flaws.length > 0 || power.perks.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            {power.flaws.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-400">Flaws:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {power.flaws.map(flaw => (
                                    <div key={flaw.name} className="bg-gray-800 text-red-400 px-2 py-0.5 rounded-full text-xs flex items-center">
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
                                    <div key={perk.name} className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-full text-xs flex items-center">
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
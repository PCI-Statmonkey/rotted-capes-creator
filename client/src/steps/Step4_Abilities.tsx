import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Minus, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";
import { calculateModifier, formatModifier } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the point buy cost table
interface PointBuyCost {
  score: number;
  cost: number;
}

const POINT_BUY_COSTS: PointBuyCost[] = [
  { score: 8, cost: 0 },
  { score: 9, cost: 1 },
  { score: 10, cost: 2 },
  { score: 11, cost: 3 },
  { score: 12, cost: 4 },
  { score: 13, cost: 5 },
  { score: 14, cost: 6 },
  { score: 15, cost: 8 },
  { score: 16, cost: 10 },
  { score: 17, cost: 12 },
];

// Total points available for abilities
const TOTAL_POINTS = 36;

// Standard array option
const STANDARD_ARRAY = [16, 15, 14, 13, 12, 11];

export default function Step4_Abilities() {
  const { character, updateAbilityScore, setCurrentStep, updateDerivedStats } = useCharacter();
  const [pointsSpent, setPointsSpent] = useState(0);
  const [localAbilities, setLocalAbilities] = useState({ ...character.abilities });
  const [assignmentMethod, setAssignmentMethod] = useState<"pointBuy" | "standardArray">("pointBuy");
  const [assignedStandardScores, setAssignedStandardScores] = useState<Record<string, number | null>>({
    strength: null,
    dexterity: null, 
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null
  });
  
  // Get origin and archetype bonuses
  const getOriginBonus = (ability: string): number => {
    const abilityLower = ability.toLowerCase();
    // No origin selected yet
    if (!character.origin) return 0;
    
    // For newer origin formats that include type in parentheses
    const originName = character.origin.split('(')[0].trim();
    
    // Handle special cases for Highly Trained with custom ability bonuses
    if (originName === "Highly Trained" && character.origin.includes("Bonuses:")) {
      const bonusText = character.origin.match(/Bonuses: (.*)\)/)?.[1] || "";
      if (bonusText.includes(`+1 ${ability.charAt(0).toUpperCase() + ability.slice(1)}`)) {
        return 1;
      }
      return 0;
    }
    
    // Handle special cases for Mystic with subtypes
    if (originName === "Mystic" && character.origin.includes("(")) {
      // If it's in the format "Mystic (Subtype: bonuses)"
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
        // Default fallback for older "Mystic" format
        if (abilityLower === "wisdom") return 2;
        if (abilityLower === "charisma") return 1;
      }
      
      return 0;
    }
    
    // Handle specific origins from the rulebook
    switch(originName) {
      case "Alien":
        if (abilityLower === "strength") return 2;
        break;
      case "Android":
        if (abilityLower === "intelligence") return 2;
        break;
      case "Cosmic":
        if (abilityLower === "constitution") return 1;
        // Second ability is user-selected, handled at character creation
        break;
      case "Demigod":
        // Ability is user-selected, handled at character creation
        break;
      case "Super-Human":
        if (abilityLower === "constitution") return 2;
        break;
      case "Tech Hero":
        if (abilityLower === "intelligence") return 2;
        break;
    }
    
    return 0;
  };
  
  const getArchetypeBonus = (ability: string): number => {
    const abilityLower = ability.toLowerCase();
    // No archetype selected yet
    if (!character.archetype) return 0;
    
    // Get just the archetype name without any additional info
    const archetypeName = character.archetype.split('(')[0].trim();
    
    // Use the exact archetypes from the rulebook
    switch(archetypeName) {
      case "Andromorph":
        if (abilityLower === "constitution") return 2;
        break;
      case "Blaster":
        if (abilityLower === "dexterity") return 1;
        if (abilityLower === "intelligence") return 1;
        break;
      case "Brawler":
        if (abilityLower === "strength") return 2;
        break;
      case "Controller":
        if (abilityLower === "intelligence") return 1;
        if (abilityLower === "wisdom") return 1;
        break;
      case "Heavy":
        if (abilityLower === "constitution") return 1;
        if (abilityLower === "strength") return 1;
        break;
      case "Infiltrator":
        if (abilityLower === "dexterity") return 2;
        break;
      case "Transporter":
        if (abilityLower === "dexterity") return 1;
        if (abilityLower === "constitution") return 1;
        break;
      // Legacy archetypes for backward compatibility
      case "Bruiser":
        if (abilityLower === "strength") return 1;
        if (abilityLower === "constitution") return 1;
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
        if (abilityLower === "wisdom") return 1;
        if (abilityLower === "intelligence") return 1;
        break;
      case "Mastermind":
        if (abilityLower === "intelligence") return 1;
        if (abilityLower === "charisma") return 1;
        break;
      case "Shapeshifter":
        if (abilityLower === "constitution") return 1;
        if (abilityLower === "dexterity") return 1;
        break;
    }
    
    return 0;
  };
  
  // Get total bonus for an ability
  const getTotalBonus = (ability: string): number => {
    return getOriginBonus(ability) + getArchetypeBonus(ability);
  };

  // Calculate total points spent whenever abilities change
  useEffect(() => {
    if (assignmentMethod === "pointBuy") {
      let total = 0;
      
      Object.keys(localAbilities).forEach((ability) => {
        const abilityKey = ability as keyof typeof localAbilities;
        const score = localAbilities[abilityKey].value;
        const cost = POINT_BUY_COSTS.find(item => item.score === score)?.cost || 0;
        total += cost;
      });
      
      setPointsSpent(total);
    }
  }, [localAbilities, assignmentMethod]);

  // Get cost for a specific score
  const getCostForScore = (score: number): number => {
    return POINT_BUY_COSTS.find(item => item.score === score)?.cost || 0;
  };

  // Standard array selection methods
  const handleSelectStandardScore = (ability: string, score: number) => {
    if (assignmentMethod !== "standardArray") return;
    
    // Check if score is already assigned to another ability
    const isScoreAssigned = Object.entries(assignedStandardScores)
      .some(([key, val]) => key !== ability && val === score);
      
    if (isScoreAssigned) return;
    
    // Update assigned scores
    const newAssignedScores = { ...assignedStandardScores, [ability]: score };
    setAssignedStandardScores(newAssignedScores);
    
    // Update local abilities
    const newAbilities = { ...localAbilities };
    newAbilities[ability as keyof typeof localAbilities] = {
      value: score,
      modifier: calculateModifier(score)
    };
    setLocalAbilities(newAbilities);
  };
  
  const isStandardScoreSelected = (score: number): boolean => {
    return Object.values(assignedStandardScores).includes(score);
  };
  
  const getSelectedStandardScore = (ability: string): number | null => {
    return assignedStandardScores[ability];
  };
  
  // Reset standard array assignments
  const resetStandardArray = () => {
    setAssignedStandardScores({
      strength: null,
      dexterity: null, 
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null
    });
    
    // Reset abilities to default values
    const defaultAbilities = { ...character.abilities };
    Object.keys(defaultAbilities).forEach(key => {
      const abilityKey = key as keyof typeof defaultAbilities;
      defaultAbilities[abilityKey] = {
        value: 10,
        modifier: calculateModifier(10)
      };
    });
    setLocalAbilities(defaultAbilities);
  };

  // Handle assignment method change
  const handleAssignmentMethodChange = (method: "pointBuy" | "standardArray") => {
    setAssignmentMethod(method);
    
    if (method === "standardArray") {
      resetStandardArray();
    }
  };

  // Handle increment ability score in point buy mode
  const handleIncrement = (ability: keyof typeof localAbilities) => {
    if (assignmentMethod !== "pointBuy") return;
    
    const currentScore = localAbilities[ability].value;
    const nextScore = currentScore + 1;
    
    // Check if next score is valid and within point budget
    if (nextScore <= 17) {
      const currentCost = getCostForScore(currentScore);
      const nextCost = getCostForScore(nextScore);
      const additionalCost = nextCost - currentCost;
      
      if (pointsSpent + additionalCost <= TOTAL_POINTS) {
        const newAbilities = { ...localAbilities };
        newAbilities[ability] = {
          value: nextScore,
          modifier: calculateModifier(nextScore)
        };
        setLocalAbilities(newAbilities);
      }
    }
  };

  // Handle decrement ability score in point buy mode
  const handleDecrement = (ability: keyof typeof localAbilities) => {
    if (assignmentMethod !== "pointBuy") return;
    
    const currentScore = localAbilities[ability].value;
    
    // Prevent scores below 8
    if (currentScore > 8) {
      const nextScore = currentScore - 1;
      const newAbilities = { ...localAbilities };
      newAbilities[ability] = {
        value: nextScore,
        modifier: calculateModifier(nextScore)
      };
      setLocalAbilities(newAbilities);
    }
  };

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(3);
  };

  // Handle going to next step
  const handleContinue = () => {
    // Update all ability scores in the character context
    // Base scores only - bonuses will be applied when needed
    Object.keys(localAbilities).forEach((ability) => {
      const abilityKey = ability as keyof typeof localAbilities;
      updateAbilityScore(abilityKey, localAbilities[abilityKey].value);
    });
    
    // Update derived stats based on new abilities (including bonuses)
    updateDerivedStats();
    
    // Track event in analytics
    trackEvent('abilities_selected', 'character', `Points: ${pointsSpent}`);
    
    // Move to the next step
    setCurrentStep(5);
  };

  // Format ability name
  const formatAbilityName = (ability: string): string => {
    return ability.charAt(0).toUpperCase() + ability.slice(1);
  };

  // Get short ability descriptions
  const getAbilityDescription = (ability: string): string => {
    const descriptions: Record<string, string> = {
      strength: "Physical power, melee attacks, carrying capacity",
      dexterity: "Agility, reflexes, ranged attacks, initiative",
      constitution: "Stamina, endurance, hit points, physical resilience",
      intelligence: "Knowledge, memory, reasoning, skill points",
      wisdom: "Awareness, intuition, perception, willpower",
      charisma: "Force of personality, leadership, social influence"
    };
    return descriptions[ability] || "";
  };

  return (
    <motion.div 
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-comic text-3xl text-accent tracking-wide">Step 4: Ability Scores</h2>
        <p className="text-gray-300 mt-2">
          Assign your character's ability scores and see bonuses from your Origin and Archetype.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs bg-gray-800 p-2 rounded-md">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-400">10</span>
            <span className="mx-1 text-sm text-green-500">+2</span>
            <span className="text-sm font-bold ml-1">12</span>
            <span className="ml-1 text-gray-400">(+1)</span>
          </div>
          <div className="text-gray-400">
            <span className="font-medium">Format:</span> Base Score + Origin/Archetype Bonus = Final Score (Modifier)
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Assignment method selection */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-comic text-xl mb-3">Choose Assignment Method</h3>
          <RadioGroup 
            value={assignmentMethod}
            onValueChange={(value) => handleAssignmentMethodChange(value as any)}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-start gap-2">
              <RadioGroupItem value="pointBuy" id="pointBuy" />
              <div>
                <Label htmlFor="pointBuy" className="font-medium">Point Buy</Label>
                <p className="text-xs text-gray-400">Distribute {TOTAL_POINTS} points across abilities</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="standardArray" id="standardArray" />
              <div>
                <Label htmlFor="standardArray" className="font-medium">Standard Array</Label>
                <p className="text-xs text-gray-400">Assign {STANDARD_ARRAY.join(', ')} to abilities</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Point Buy Summary - Only shown in point buy mode */}
        {assignmentMethod === "pointBuy" && (
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div>
              <span className="text-gray-400">Points Spent:</span>
              <span className={`ml-2 font-bold ${pointsSpent > TOTAL_POINTS ? 'text-red-500' : 'text-accent'}`}>
                {pointsSpent}
              </span>
              <span className="text-gray-400"> / {TOTAL_POINTS}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold">Point Buy Costs</h4>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      {POINT_BUY_COSTS.map(item => (
                        <div key={item.score} className="bg-gray-700 p-1 rounded text-center">
                          {item.score}: {item.cost}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Standard Array Selection - Only shown in standard array mode */}
        {assignmentMethod === "standardArray" && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Standard Array</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetStandardArray}
                className="h-8 flex gap-1 items-center text-xs"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {STANDARD_ARRAY.map(score => (
                <div key={score} className={`
                  p-2 rounded-md text-center w-12 font-bold 
                  ${isStandardScoreSelected(score) ? 'bg-gray-600 text-gray-400' : 'bg-accent text-white'}
                `}>
                  {score}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Click on a score and then on an ability to assign it
            </p>
          </div>
        )}

        {/* Ability Scores */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(localAbilities).map((ability) => {
            const abilityKey = ability as keyof typeof localAbilities;
            const abilityValue = localAbilities[abilityKey].value;
            const abilityMod = localAbilities[abilityKey].modifier;
            const bonus = getTotalBonus(ability);
            
            return (
              <div 
                key={ability}
                className={`
                  bg-gray-800 rounded-lg p-4 border-2 border-gray-700 flex flex-col
                  ${assignmentMethod === 'standardArray' && !getSelectedStandardScore(ability) ? 
                    'cursor-pointer hover:border-accent' : ''}
                `}
                onClick={() => {
                  if (assignmentMethod === 'standardArray') {
                    // Find first unassigned score
                    const availableScore = STANDARD_ARRAY.find(score => !isStandardScoreSelected(score));
                    if (availableScore) {
                      handleSelectStandardScore(ability, availableScore);
                    }
                  }
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-comic text-lg truncate">{formatAbilityName(ability)}</h3>
                  <div className="flex items-center">
                    {/* Base score */}
                    <span className="text-sm font-medium text-gray-400">{abilityValue}</span>
                    
                    {/* Bonus from origin/archetype */}
                    {bonus > 0 && (
                      <span className="mx-1 text-sm text-green-500">+{bonus}</span>
                    )}
                    
                    {/* Final score */}
                    <span className="text-lg font-bold ml-1">{abilityValue + bonus}</span>
                    
                    {/* Modifier based on final score */}
                    <span className="ml-2 text-gray-400">({formatModifier(calculateModifier(abilityValue + bonus))})</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mb-3">{getAbilityDescription(ability)}</p>
                
                {assignmentMethod === "pointBuy" ? (
                  <div className="flex justify-between mt-auto">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecrement(abilityKey);
                      }}
                      disabled={abilityValue <= 8}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">Cost: </span>
                      <span className="ml-1 font-bold">{getCostForScore(abilityValue)}</span>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncrement(abilityKey);
                      }}
                      disabled={abilityValue >= 17 || (pointsSpent + (getCostForScore(abilityValue + 1) - getCostForScore(abilityValue))) > TOTAL_POINTS}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-auto">
                    {getSelectedStandardScore(ability) ? (
                      <div className="text-center p-2 rounded bg-gray-700">
                        <span>Assigned: </span>
                        <span className="font-bold">{getSelectedStandardScore(ability)}</span>
                        {bonus > 0 && <span className="text-green-500 ml-1">(+{bonus} bonus)</span>}
                      </div>
                    ) : (
                      <p className="text-xs text-center italic text-gray-500">
                        Click to assign a score
                      </p>
                    )}
                  </div>
                )}
                
                {/* Origin and Archetype Bonuses */}
                {(getOriginBonus(ability) > 0 || getArchetypeBonus(ability) > 0) && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
                    {getOriginBonus(ability) > 0 && (
                      <div className="text-green-500 flex justify-between">
                        <span>Origin: {character.origin}</span>
                        <span>+{getOriginBonus(ability)}</span>
                      </div>
                    )}
                    {getArchetypeBonus(ability) > 0 && (
                      <div className="text-green-500 flex justify-between">
                        <span>Archetype: {character.archetype}</span>
                        <span>+{getArchetypeBonus(ability)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
            disabled={pointsSpent > TOTAL_POINTS}
          >
            Next <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
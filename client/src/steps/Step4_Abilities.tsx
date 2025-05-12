import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Minus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function Step4_Abilities() {
  const { character, updateAbilityScore, setCurrentStep, updateDerivedStats } = useCharacter();
  const [pointsSpent, setPointsSpent] = useState(0);
  const [localAbilities, setLocalAbilities] = useState({ ...character.abilities });

  // Calculate total points spent whenever abilities change
  useEffect(() => {
    let total = 0;
    
    Object.keys(localAbilities).forEach((ability) => {
      const abilityKey = ability as keyof typeof localAbilities;
      const score = localAbilities[abilityKey].value;
      const cost = POINT_BUY_COSTS.find(item => item.score === score)?.cost || 0;
      total += cost;
    });
    
    setPointsSpent(total);
  }, [localAbilities]);

  // Get cost for a specific score
  const getCostForScore = (score: number): number => {
    return POINT_BUY_COSTS.find(item => item.score === score)?.cost || 0;
  };

  // Handle increment ability score
  const handleIncrement = (ability: keyof typeof localAbilities) => {
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

  // Handle decrement ability score
  const handleDecrement = (ability: keyof typeof localAbilities) => {
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
    Object.keys(localAbilities).forEach((ability) => {
      const abilityKey = ability as keyof typeof localAbilities;
      updateAbilityScore(abilityKey, localAbilities[abilityKey].value);
    });
    
    // Update derived stats based on new abilities
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
          Distribute ability points using the point-buy system. You have {TOTAL_POINTS} points to spend.
        </p>
      </div>

      <div className="space-y-6">
        {/* Points summary */}
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

        {/* Ability Scores */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(localAbilities).map((ability) => {
            const abilityKey = ability as keyof typeof localAbilities;
            const abilityValue = localAbilities[abilityKey].value;
            const abilityMod = localAbilities[abilityKey].modifier;
            
            return (
              <div 
                key={ability}
                className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 flex flex-col"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-comic text-xl">{formatAbilityName(ability)}</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-bold">{abilityValue}</span>
                    <span className="ml-2 text-gray-400">({formatModifier(abilityMod)})</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mb-3">{getAbilityDescription(ability)}</p>
                
                <div className="flex justify-between mt-auto">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDecrement(abilityKey)}
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
                    onClick={() => handleIncrement(abilityKey)}
                    disabled={abilityValue >= 17 || (pointsSpent + (getCostForScore(abilityValue + 1) - getCostForScore(abilityValue))) > TOTAL_POINTS}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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
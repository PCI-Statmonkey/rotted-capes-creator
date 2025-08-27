import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import skillSetsData from "@/rules/skills.json";
import featsData from "@/rules/feats.json";
import weaknessesData from "@/rules/weaknesses.json";
import { displayFeatName } from "@/lib/utils";

// Define weakness types
type WeaknessType =
  | "Addiction"
  | "DarkSecret"
  | "Dependence"
  | "Dependent"
  | "DiminishedVitality"
  | "Enemy"
  | "Taboo"
  | "MentalCondition"
  | "PhysicalCondition"
  | "PhysicalVulnerabilities"
  | "RavenousMetabolism"
  | "StrangeAppearance"
  | "Custom";

// Define weakness interface
interface Weakness {
  type: WeaknessType;
  name: string;
  description: string;
  points: number;
  details?: {
    substanceType?: "Common" | "Uncommon" | "Rare";
    negativeEffect?: string;
    dependentType?: string;
    secretLevel?: string;
    enemyType?: string;
    restriction?: string;
    atonement?: string;
  };
}

// Sample dependents for users to choose from
const SAMPLE_DEPENDENTS = [
  { name: "Younger Sibling", description: "The younger sibling usually idolizes you and wants to be just like you when they grow up." },
  { name: "Child", description: "The child is often far younger than a sibling, and is less capable of taking care of themselves." },
  { name: "Spouse/Lover", description: "Unlike many who survived the onset of Z-Day, you were able to protect your spouse or lover from the zombie hordes." },
  { name: "Elderly Relative", description: "Be it your father, grandmother, or aged aunt, you seek to protect and keep safe one of the last remaining members of your immediate family." },
  { name: "Mentor/Father Figure", description: "Unlike the younger sibling who looks up to you, this is someone you look up to." },
  { name: "Beloved Pet", description: "When you've lost everything, then you might seek solace in an animal companion." }
];

const ABILITIES = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

export default function Step6_Weaknesses() {
  const { character, updateCharacterField, updateAbilityScore, setCurrentStep, saveCharacter } = useCharacter();
  const [selectedWeaknessType, setSelectedWeaknessType] = useState<WeaknessType | "">("");
  const [newWeakness, setNewWeakness] = useState<Weakness>({
    type: "Custom",
    name: "",
    description: "",
    points: 0,
    details: {}
  });
  const [totalWeaknessPoints, setTotalWeaknessPoints] = useState<number>(0);
  const [remainingWeaknessPoints, setRemainingWeaknessPoints] = useState<number>(0);
  const [allocations, setAllocations] = useState<Array<{
    type: string;
    target: string;
    amount: number;
  }>>([]);

  const [fivePointSkill, setFivePointSkill] = useState("");
  const [fivePointAbility, setFivePointAbility] = useState("");
  const [tenPointMode, setTenPointMode] = useState<"feat" | "ability">("feat");
  const [tenPointFeat, setTenPointFeat] = useState("");
  const [tenPointAbility1, setTenPointAbility1] = useState("");
  const [tenPointAbility2, setTenPointAbility2] = useState("");
  const [tenPointPower1, setTenPointPower1] = useState("");
  const [tenPointPower2, setTenPointPower2] = useState("");
  const [fifteenPointAbility, setFifteenPointAbility] = useState("");

  // Calculate total weakness points
  const calculatePoints = () => {
    const points = character.complications.reduce((total, weakness) => {
      return total + (weakness.points || 0);
    }, 0);
    setTotalWeaknessPoints(points);
    setRemainingWeaknessPoints(points - allocations.reduce((total, alloc) => total + alloc.amount, 0));
  };

  useEffect(() => {
    calculatePoints();
  }, [character.complications, allocations]);

  // Handle going to previous step
  const handlePrevious = () => {
    // Save progress and navigate to previous step - Powers
    saveCharacter();
    window.location.href = "/creator/powers";
  };

  // Handle going to next step
  const handleContinue = () => {
    // Track the event in analytics
    trackEvent('complete_step', 'character_creation', 'weaknesses');
    
    // Save progress and navigate to next step - Skills & Feats
    saveCharacter();
    window.location.href = "/creator/skillsfeats";
  };

  // Add a weakness to the character
  const addWeakness = () => {
    if (newWeakness.name.trim() && newWeakness.description.trim() && selectedWeaknessType) {
      // Create a copy of the current weaknesses array
      const updatedWeaknesses = [...character.complications];
      
      // Add the new weakness
      updatedWeaknesses.push({
        name: newWeakness.name,
        description: newWeakness.description,
        points: newWeakness.points,
        type: selectedWeaknessType
      });
      
      // Update the character
      updateCharacterField('complications', updatedWeaknesses);
      
      // Reset the form
      setNewWeakness({
        type: "Custom",
        name: "",
        description: "",
        points: 0,
        details: {}
      });
      setSelectedWeaknessType("");
      
      // Recalculate points
      calculatePoints();
    }
  };

  // Remove a weakness from the character
  const removeWeakness = (index: number) => {
    const updatedWeaknesses = [...character.complications];
    updatedWeaknesses.splice(index, 1);
    updateCharacterField('complications', updatedWeaknesses);
    calculatePoints();
  };

  // Handle weakness type selection
  const handleWeaknessTypeChange = (type: WeaknessType) => {
    setSelectedWeaknessType(type);

    // Look up the display name from the data
    const found = weaknessesData.find((w) => w.id === type);

    // Reset the form with appropriate defaults based on type
    let initialPoints = 0;

    // Set initial points for simple weakness types
    if (type === "DiminishedVitality" || type === "RavenousMetabolism") {
      initialPoints = 5;
    }

    setNewWeakness({
      type,
      name: found ? found.name : type,
      description: "",
      points: initialPoints,
      details: {}
    });
  };

  // Handle substance type selection
  const handleSubstanceTypeChange = (substanceType: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        substanceType: substanceType as "Common" | "Uncommon" | "Rare"
      },
      points: substanceType === "Common" ? 5 : substanceType === "Uncommon" ? 10 : 15
    });
  };

  // Handle negative effect selection
  const handleNegativeEffectChange = (negativeEffect: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        negativeEffect: negativeEffect
      },
      points: (newWeakness.details?.substanceType === "Common" ? 5 : 
               newWeakness.details?.substanceType === "Uncommon" ? 10 : 15) + 
              (negativeEffect === "PowerNegation" || negativeEffect === "PhysicalWeakness" ? 5 : 
               negativeEffect === "IncapacitatingWeakness" ? 10 : 15)
    });
  };

  // Handle dependent type selection
  const handleDependentTypeChange = (dependentType: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        dependentType: dependentType
      },
      points: dependentType === "Average" ? 5 : dependentType === "Weak" ? 10 : 15
    });
  };

  // Handle dark secret level selection
  const handleSecretLevelChange = (secretLevel: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        secretLevel: secretLevel
      },
      points: secretLevel === "Trivial" ? 5 : secretLevel === "Serious" ? 10 : 15
    });
  };

  // Handle enemy type selection
  const handleEnemyTypeChange = (enemyType: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        enemyType: enemyType
      },
      points: enemyType === "Standard" ? 5 : 10
    });
  };

  // Handle restriction selection for Taboo
  const handleRestrictionChange = (restriction: string) => {
    setNewWeakness({
      ...newWeakness,
      details: {
        ...newWeakness.details,
        restriction: restriction
      },
      points: restriction === "Easy" ? 0 : restriction === "Moderate" ? 5 : 10
    });
  };

  const applyAbilityOrPower = (target: string, bonus: number) => {
    if (ABILITIES.map(a => a.toLowerCase()).includes(target.toLowerCase())) {
      const key = target.toLowerCase() as keyof typeof character.abilities;
      const current = character.abilities[key].value;
      updateAbilityScore(key, Math.min(25, current + bonus));
    } else {
      const updated = character.powers.map(p => {
        if (p.name === target) {
          const score = p.finalScore ?? p.score ?? 10;
          return { ...p, finalScore: Math.min(25, score + bonus) };
        }
        return p;
      });
      updateCharacterField('powers', updated);
    }
  };

  const handleAllocate5 = () => {
    if (remainingWeaknessPoints < 5 || !fivePointSkill || !fivePointAbility) return;
    if (!character.skills.some(s => s.name === fivePointSkill)) {
      updateCharacterField('skills', [...character.skills, { name: fivePointSkill, ability: '', ranks: 0, trained: true }]);
    }
    applyAbilityOrPower(fivePointAbility, 1);
    setAllocations([...allocations, { type: '5', target: `${fivePointSkill} + ${fivePointAbility}`, amount: 5 }]);
    setFivePointSkill('');
    setFivePointAbility('');
  };

  const handleAllocate10 = () => {
    if (remainingWeaknessPoints < 10) return;
    if (tenPointMode === 'feat') {
      if (!tenPointFeat) return;
      if (tenPointFeat.startsWith('Power Score Increase')) {
        if (!tenPointPower1) return;
        applyAbilityOrPower(tenPointPower1, 1);
        applyAbilityOrPower(tenPointPower2 || tenPointPower1, 1);
        const featObj = {
          name: tenPointFeat,
          powerChoices: [tenPointPower1, tenPointPower2 || tenPointPower1],
          source: 'Weakness',
        };
        if (!character.feats.some(f => f.name === tenPointFeat)) {
          updateCharacterField('feats', [...character.feats, featObj]);
        }
        setAllocations([...allocations, { type: '10-feat', target: tenPointFeat, amount: 10 }]);
        setTenPointFeat('');
        setTenPointPower1('');
        setTenPointPower2('');
      } else {
        if (!character.feats.some(f => f.name === tenPointFeat)) {
          updateCharacterField('feats', [...character.feats, { name: tenPointFeat, source: 'Weakness' }]);
        }
        setAllocations([...allocations, { type: '10-feat', target: tenPointFeat, amount: 10 }]);
        setTenPointFeat('');
        setTenPointPower1('');
        setTenPointPower2('');
      }
    } else {
      if (!tenPointAbility1 || !tenPointAbility2) return;
      applyAbilityOrPower(tenPointAbility1, 1);
      applyAbilityOrPower(tenPointAbility2, 1);
      setAllocations([...allocations, { type: '10-ability', target: `${tenPointAbility1} & ${tenPointAbility2}`, amount: 10 }]);
      setTenPointAbility1('');
      setTenPointAbility2('');
    }
  };

  const handleAllocate15 = () => {
    if (remainingWeaknessPoints < 15 || !fifteenPointAbility) return;
    applyAbilityOrPower(fifteenPointAbility, 2);
    setAllocations([...allocations, { type: '15-ability', target: fifteenPointAbility, amount: 15 }]);
    setFifteenPointAbility('');
  };

  // Check if we can add the current weakness
  const canAddWeakness = () => {
    if (!selectedWeaknessType) return false;
    
    // Basic check
    const hasName = !!newWeakness.name;
    const hasDescription = !!newWeakness.description;
    
    return hasName && hasDescription;
  };

  // Select a sample dependent
  const selectSampleDependent = (dependent: { name: string, description: string }) => {
    if (selectedWeaknessType === "Dependent") {
      setNewWeakness({
        ...newWeakness,
        name: "Dependent: " + dependent.name,
        description: dependent.description
      });
    }
  };

  // Check if we can proceed to the next step
  const canProceed = () => {
    // Weaknesses are optional, so we can always proceed
    return true;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-gray-900 bg-opacity-60 p-6 rounded-xl shadow-xl">
        <h2 className="text-3xl font-display font-bold text-red-500 mb-6">Step 6: Character Weaknesses</h2>
        
        <div className="text-gray-300 mb-6 font-comic-light">
          <p className="mb-2">
            Many heroes possess unique flaws, which in many ways define them as a hero. 
            Maybe your hero is violently allergic to rare metal, maybe you are particularly 
            vulnerable to sonic attacks, or find all their powers nullified around strong 
            electrical fields.
          </p>
          <p className="text-yellow-300 mb-2">
            You are not required to choose a weakness. You may choose to skip this step.
          </p>
          <p className="mb-2">
            When you choose a weakness, you gain points that you can spend on ability score 
            bonuses, power score bonuses, or bonus feats. You may only acquire a maximum 
            of 20 points through weaknesses.
          </p>

        </div>
        
        {/* Points Summary */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-xl font-comic mb-3">Weakness Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300 font-comic-light">Total Points: <span className="text-accent">{totalWeaknessPoints}</span>/20</p>
              <p className="text-sm text-gray-300 font-comic-light">Remaining Points: <span className="text-accent">{remainingWeaknessPoints}</span></p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1 font-comic-light">Point Usage Options:</h4>
              <ul className="text-xs text-gray-400 list-disc pl-4 font-comic-light">
                <li>5 points: Gain training in a skill and +1 to any ability/power score (max 25)</li>
                <li>10 points: Gain a feat or +1 to any two ability/power scores (max 25)</li>
                <li>15 points: Gain +2 to any ability/power score (max 25)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Current Weaknesses */}
        <div className="mb-8">
          <h3 className="text-xl font-comic mb-3">Your Weaknesses</h3>
          
          {character.complications.length === 0 ? (
            <div className="p-4 bg-gray-800 rounded-lg text-gray-400 italic">
              No weaknesses added yet. Weaknesses are optional, but they can add depth to your character.
            </div>
          ) : (
            <div className="space-y-2">
              {character.complications.map((weakness, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gray-800 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-accent font-comic-light">{weakness.name}</h4>
                      <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs font-comic-light">
                        {weakness.points} points
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 font-comic-light">{weakness.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeWeakness(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add New Weakness */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-comic mb-3">Add a Weakness</h3>
          
          {/* Weakness Type Selection */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Weakness Type</label>
            <Select 
              onValueChange={(value) => handleWeaknessTypeChange(value as WeaknessType)}
              value={selectedWeaknessType}
            >
              <SelectTrigger className="bg-gray-700">
                <SelectValue placeholder="Select a weakness type" />
              </SelectTrigger>
              <SelectContent>
                {weaknessesData.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
                <SelectItem value="Custom">Custom Weakness</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Weakness Details based on type */}
          {selectedWeaknessType && (
            <div className="space-y-4">
              {/* Type-specific UI */}
              {selectedWeaknessType === "Addiction" && (
                <div>
                  <label className="block text-sm mb-1">Substance Type</label>
                  <Select onValueChange={handleSubstanceTypeChange}>
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue placeholder="Select substance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common">Common Substance (5 points)</SelectItem>
                      <SelectItem value="Uncommon">Uncommon Substance (10 points)</SelectItem>
                      <SelectItem value="Rare">Rare Substance (15 points)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-3">
                    <label className="block text-sm mb-1">Addiction Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe your character's addiction..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              {/* Dark Secret */}
              {selectedWeaknessType === "DarkSecret" && (
                <div>
                  <label className="block text-sm mb-1">Secret Level</label>
                  <Select onValueChange={handleSecretLevelChange}>
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue placeholder="Select secret level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trivial">Trivial Secret (5 points)</SelectItem>
                      <SelectItem value="Serious">Serious Secret (10 points)</SelectItem>
                      <SelectItem value="Severe">Severe Secret (15 points)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-3">
                    <label className="block text-sm mb-1">Secret Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe your character's dark secret..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              {/* Dependence */}
              {selectedWeaknessType === "Dependence" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Substance/Condition</label>
                    <Select onValueChange={handleSubstanceTypeChange}>
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select substance/condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Common">Common Substance/Condition (0 points)</SelectItem>
                        <SelectItem value="Uncommon">Uncommon Substance/Condition (5 points)</SelectItem>
                        <SelectItem value="Rare">Rare Substance/Condition (10 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Negative Effect</label>
                    <Select onValueChange={handleNegativeEffectChange}>
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select negative effect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PowerNegation">Power Negation (5 points)</SelectItem>
                        <SelectItem value="PhysicalWeakness">Physical Weakness (5 points)</SelectItem>
                        <SelectItem value="IncapacitatingWeakness">Incapacitating Weakness (10 points)</SelectItem>
                        <SelectItem value="FatalWeakness">Fatal Weakness (15 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Dependence Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe your character's dependence..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              {/* Dependent */}
              {selectedWeaknessType === "Dependent" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Dependent Type</label>
                    <Select onValueChange={handleDependentTypeChange}>
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select dependent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Average">Average Health (5 points)</SelectItem>
                        <SelectItem value="Weak">Weak Health (10 points)</SelectItem>
                        <SelectItem value="Frail">Frail Health (15 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Dependent Name</label>
                    <Input 
                      value={newWeakness.name.replace("Dependent: ", "")}
                      onChange={(e) => setNewWeakness({...newWeakness, name: "Dependent: " + e.target.value})}
                      placeholder="e.g., Little Sister, Father, Pet Cat"
                      className="bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Dependent Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe your character's dependent..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Sample Dependents</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {SAMPLE_DEPENDENTS.map((dependent) => (
                        <div 
                          key={dependent.name}
                          className="p-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors text-sm"
                          onClick={() => selectSampleDependent(dependent)}
                        >
                          <h4 className="font-medium">{dependent.name}</h4>
                          <p className="text-xs text-gray-300 mt-1 line-clamp-2">{dependent.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Diminished Vitality */}
              {selectedWeaknessType === "DiminishedVitality" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Weakness Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe how having reduced stamina affects your character..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                  
                  <div className="bg-gray-700 p-3 rounded-md">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Effect:</span> Reduce your maximum stamina by 10.
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      <span className="font-semibold">Point Value:</span> 5 points
                    </p>
                  </div>
                </div>
              )}
              
              {/* Enemy */}
              {selectedWeaknessType === "Enemy" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Enemy Type</label>
                    <Select onValueChange={handleEnemyTypeChange}>
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select enemy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard Enemy (5 points)</SelectItem>
                        <SelectItem value="Tyrant">Tyrant (10 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Enemy Name</label>
                    <Input 
                      value={newWeakness.name.replace("Enemy: ", "")}
                      onChange={(e) => setNewWeakness({...newWeakness, name: "Enemy: " + e.target.value})}
                      placeholder="e.g., The Biker Gang, Cannibal Cult, Former Supervillain"
                      className="bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Enemy Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe your enemy and why they're after you..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              {/* Taboo */}
              {selectedWeaknessType === "Taboo" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Restriction Type</label>
                    <Select onValueChange={handleRestrictionChange}>
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select restriction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy Restriction (0 points)</SelectItem>
                        <SelectItem value="Moderate">Moderate Restriction (5 points)</SelectItem>
                        <SelectItem value="Difficult">Difficult Restriction (10 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Taboo Name</label>
                    <Input 
                      value={newWeakness.name.replace("Taboo: ", "")}
                      onChange={(e) => setNewWeakness({...newWeakness, name: "Taboo: " + e.target.value})}
                      placeholder="e.g., Cannot Touch Metal, Must Ask Permission to Enter"
                      className="bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Taboo Details</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe the taboo and how it affects your character..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Generic form for other weakness types */}
              {![
                "Addiction",
                "DarkSecret",
                "Dependence",
                "Dependent",
                "DiminishedVitality",
                "Enemy",
                "Taboo",
                "Custom",
              ].includes(selectedWeaknessType) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea
                      value={newWeakness.description}
                      onChange={(e) =>
                        setNewWeakness({ ...newWeakness, description: e.target.value })
                      }
                      placeholder={`Describe your character's ${newWeakness.name.toLowerCase()}...`}
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Point Value</label>
                    <Select
                      onValueChange={(value) =>
                        setNewWeakness({ ...newWeakness, points: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select point value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Minor Weakness (5 points)</SelectItem>
                        <SelectItem value="10">Moderate Weakness (10 points)</SelectItem>
                        <SelectItem value="15">Major Weakness (15 points)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Custom Weakness */}
              {selectedWeaknessType === "Custom" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Weakness Name</label>
                    <Input 
                      value={newWeakness.name}
                      onChange={(e) => setNewWeakness({...newWeakness, name: e.target.value})}
                      placeholder="e.g., Vulnerability to Cold, Phobia of Heights"
                      className="bg-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea 
                      value={newWeakness.description}
                      onChange={(e) => setNewWeakness({...newWeakness, description: e.target.value})}
                      placeholder="Describe how this weakness affects your character..."
                      className="bg-gray-700"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Point Value</label>
                    <Select 
                      onValueChange={(value) => setNewWeakness({...newWeakness, points: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select point value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Minor Weakness (5 points)</SelectItem>
                        <SelectItem value="10">Moderate Weakness (10 points)</SelectItem>
                        <SelectItem value="15">Major Weakness (15 points)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">
                      The point value should reflect the severity and frequency of the weakness.
                      This requires Editor-in-Chief approval.
                    </p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={addWeakness}
                disabled={!canAddWeakness()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Weakness
              </Button>
            </div>
          )}
        </div>
        
        {/* Point Allocation */}
        {totalWeaknessPoints > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-comic mb-3">Allocate Weakness Points</h3>
            <p className="text-sm text-gray-400 mb-4">
              You have <span className="text-accent">{remainingWeaknessPoints}</span> points remaining to allocate.
            </p>
            {allocations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-comic-light mb-1">Spent Points</h4>
                <ul className="list-disc pl-4 text-sm text-gray-300 font-comic-light">
                  {allocations.map((a, idx) => (
                    <li key={idx}>{a.amount} pts - {a.target}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-accent">
                  5 Points: Gain training in a skill set and +1 to any ability/power score
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <div>
                      <label className="block text-sm mb-1">Skill Set</label>
                      <Select value={fivePointSkill} onValueChange={setFivePointSkill}>
                        <SelectTrigger className="bg-gray-700">
                          <SelectValue placeholder="Select skill set" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillSetsData.map((s) => (
                            <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Ability or Power</label>
                      <Select value={fivePointAbility} onValueChange={setFivePointAbility}>
                        <SelectTrigger className="bg-gray-700">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          {ABILITIES.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                          {character.powers.map((p) => (
                            <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAllocate5} disabled={!fivePointSkill || !fivePointAbility || remainingWeaknessPoints < 5} className="w-full">
                      Spend 5 Points
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-accent">
                  10 Points: Gain a feat or +1 to any two ability/power scores
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <div>
                      <label className="block text-sm mb-1">Allocation Type</label>
                      <Select value={tenPointMode} onValueChange={(v) => setTenPointMode(v as "feat" | "ability") }>
                        <SelectTrigger className="bg-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feat">Feat</SelectItem>
                          <SelectItem value="ability">Abilities/Powers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {tenPointMode === 'feat' ? (
                      <div>
                        <label className="block text-sm mb-1">Feat</label>
                        <Select
                          value={tenPointFeat}
                          onValueChange={(v) => {
                            setTenPointFeat(v);
                            setTenPointPower1('');
                            setTenPointPower2('');
                          }}
                        >
                          <SelectTrigger className="bg-gray-700">
                            <SelectValue placeholder="Select feat" />
                          </SelectTrigger>
                          <SelectContent>
                            {featsData.map((f) => (
                              <SelectItem key={f.name} value={f.name}>
                                {displayFeatName(f.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {tenPointFeat.startsWith('Power Score Increase') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="block text-sm mb-1">Power 1</label>
                              <Select
                                value={tenPointPower1}
                                onValueChange={(v) =>
                                  setTenPointPower1(v === 'none' ? '' : v)
                                }
                              >
                                <SelectTrigger className="bg-gray-700">
                                  <SelectValue placeholder="Select power" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {character.powers.map((p) => (
                                    <SelectItem key={p.name} value={p.name}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Power 2 (optional)</label>
                              <Select
                                value={tenPointPower2}
                                onValueChange={(v) =>
                                  setTenPointPower2(v === 'none' ? '' : v)
                                }
                              >
                                <SelectTrigger className="bg-gray-700">
                                  <SelectValue placeholder="Select power" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {character.powers.map((p) => (
                                    <SelectItem key={p.name} value={p.name}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm mb-1">Ability/Power 1</label>
                          <Select value={tenPointAbility1} onValueChange={setTenPointAbility1}>
                            <SelectTrigger className="bg-gray-700">
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                              {ABILITIES.map((a) => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
                              ))}
                              {character.powers.map((p) => (
                                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Ability/Power 2</label>
                          <Select value={tenPointAbility2} onValueChange={setTenPointAbility2}>
                            <SelectTrigger className="bg-gray-700">
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                            <SelectContent>
                              {ABILITIES.map((a) => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
                              ))}
                              {character.powers.map((p) => (
                                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={handleAllocate10}
                      disabled={
                        tenPointMode === 'feat'
                          ? !tenPointFeat || (tenPointFeat.startsWith('Power Score Increase') && !tenPointPower1) || remainingWeaknessPoints < 10
                          : !tenPointAbility1 || !tenPointAbility2 || remainingWeaknessPoints < 10
                      }
                      className="w-full"
                    >
                      Spend 10 Points
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-accent">
                  15 Points: Gain +2 to any ability/power score
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <div>
                      <label className="block text-sm mb-1">Ability or Power</label>
                      <Select value={fifteenPointAbility} onValueChange={setFifteenPointAbility}>
                        <SelectTrigger className="bg-gray-700">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent>
                          {ABILITIES.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                          {character.powers.map((p) => (
                            <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAllocate15} disabled={!fifteenPointAbility || remainingWeaknessPoints < 15} className="w-full">
                      Spend 15 Points
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
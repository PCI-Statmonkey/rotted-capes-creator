import { useState } from "react";
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

// Define weakness types
type WeaknessType = 
  | "Addiction" 
  | "DarkSecret" 
  | "Dependence" 
  | "Dependent" 
  | "DiminishedVitality" 
  | "Enemy" 
  | "Taboo" 
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

export default function Step7_Weaknesses() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
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

  // Calculate total weakness points
  const calculatePoints = () => {
    const points = character.complications.reduce((total, weakness) => {
      return total + (weakness.points || 0);
    }, 0);
    setTotalWeaknessPoints(points);
    setRemainingWeaknessPoints(points - allocations.reduce((total, alloc) => total + alloc.amount, 0));
  };

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(6);
  };

  // Handle going to next step
  const handleContinue = () => {
    // Track the event in analytics
    trackEvent('complete_step', 'character_creation', 'weaknesses');
    
    setCurrentStep(8);
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
    
    // Reset the form with appropriate defaults based on type
    let initialPoints = 0;
    
    // Set initial points for simple weakness types
    if (type === "DiminishedVitality") {
      initialPoints = 5;
    }
    
    setNewWeakness({
      type,
      name: type,
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
        <h2 className="text-3xl font-bold text-white mb-6 font-comic">Character Weaknesses</h2>
        
        <div className="text-gray-300 mb-6">
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
              <p className="text-sm text-gray-300">Total Points: <span className="text-accent">{totalWeaknessPoints}</span>/20</p>
              <p className="text-sm text-gray-300">Remaining Points: <span className="text-accent">{remainingWeaknessPoints}</span></p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Point Usage Options:</h4>
              <ul className="text-xs text-gray-400 list-disc pl-4">
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
                      <h4 className="font-medium text-accent">{complication.name}</h4>
                      <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                        {complication.points} points
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{complication.description}</p>
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
                <SelectItem value="Addiction">Addiction</SelectItem>
                <SelectItem value="DarkSecret">Dark Secret</SelectItem>
                <SelectItem value="Dependence">Dependence</SelectItem>
                <SelectItem value="Dependent">Dependent</SelectItem>
                <SelectItem value="DiminishedVitality">Diminished Vitality</SelectItem>
                <SelectItem value="Enemy">Enemy</SelectItem>
                <SelectItem value="Taboo">Taboo</SelectItem>
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
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-accent">
                  5 Points: Gain training in a skill and +1 to any ability/power score
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <p className="text-sm text-gray-300">
                      Coming soon: Ability to allocate 5 points to gain training in a skill and 
                      receive a +1 bonus to any ability or power score (up to a maximum of 25).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-accent">
                  10 Points: Gain a feat or +1 to any two ability/power scores
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <p className="text-sm text-gray-300">
                      Coming soon: Ability to allocate 10 points to gain a feat or 
                      +1 to any two ability or power scores (up to a maximum of 25).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-accent">
                  15 Points: Gain +2 to any ability/power score
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-2">
                    <p className="text-sm text-gray-300">
                      Coming soon: Ability to allocate 15 points to gain a +2 bonus 
                      to any ability or power score (up to a maximum score of 25).
                    </p>
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
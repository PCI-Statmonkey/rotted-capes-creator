import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X, PlusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// Define the weakness types
type WeaknessType = "Addiction" | "DarkSecret" | "Dependence" | "Dependent" | "Custom";

// Define the weakness structure
interface Weakness {
  type: WeaknessType;
  name: string;
  description: string;
  points: number;
  details?: {
    substanceType?: "Common" | "Uncommon" | "Rare";
    negativeEffect?: "PowerNegation" | "PhysicalWeakness" | "IncapacitatingWeakness" | "FatalWeakness";
    dependentType?: "Average" | "Weak" | "Frail";
    secretLevel?: "Trivial" | "Serious" | "Severe";
  };
}

// Define the weakness options
const WEAKNESSES: Record<WeaknessType, {
  title: string;
  description: string;
  options?: {
    substance?: Array<{id: string, name: string, description: string, points: number}>;
    negativeEffects?: Array<{id: string, name: string, description: string, points: number}>;
    secretLevels?: Array<{id: string, name: string, description: string, points: number}>;
    dependentTypes?: Array<{id: string, name: string, description: string, points: number}>;
  };
}> = {
  "Addiction": {
    title: "Addiction",
    description: "You need it. You want it. You gotta have it. There is something out there you desperately crave.",
    options: {
      substance: [
        {
          id: "Common",
          name: "Common Substance",
          description: "Substances could include sugar and/or surgery foods (such as candy), cigarettes, or coffee.",
          points: 5
        },
        {
          id: "Uncommon",
          name: "Uncommon Substance",
          description: "Substances could include certain mild drugs (such as marijuana or commercial painkillers), vaping (electronic cigarettes), alcohol, or inhaling certain chemical fumes.",
          points: 10
        },
        {
          id: "Rare",
          name: "Rare Substance",
          description: "Substances could include hard drugs (cocaine, meth, PCP, and the like), commercially available amphetamines, or medical painkiller (such as Oxycodone and the like).",
          points: 15
        }
      ]
    }
  },
  "DarkSecret": {
    title: "Dark Secret",
    description: "There is something about you you'd prefer to keep hidden.",
    options: {
      secretLevels: [
        {
          id: "Trivial",
          name: "Trivial Secret",
          description: "Your secret is something trivial and more potentially embarrassing than damaging. For example, maybe you were a boyband pop star, participated in a low-brow reality show, was a cringeworthy YouTuber, or had a popular We Fan page.",
          points: 5
        },
        {
          id: "Serious",
          name: "Serious Secret",
          description: "Maybe you made a few deals with supervillains, or you are a former criminal (whose crimes go beyond petty theft and the like). Or, they may claim experience you don't have (such as claiming to be a doctor, having military experience, or being a police officer).",
          points: 10
        },
        {
          id: "Severe",
          name: "Severe Secret",
          description: "You may have resorted to cannibalism to survive the initial aftermath of Z-Day, maybe you're a registered sex offender, or you may have committed one or more murders (either before or after Z-Day). Or, they may claim to be someone they're not — a former US Senator, a high-ranking member of the Federal government, or they've taken the identity of a different B-Lister (who may or may not still be alive).",
          points: 15
        }
      ]
    }
  },
  "Dependence": {
    title: "Dependence",
    description: "Your metabolism or physiology is such that you require frequent exposure to a particular condition or you must partake of a specific substance.",
    options: {
      substance: [
        {
          id: "Common",
          name: "Common Substance/Condition",
          description: "Substances could include immersion in water, exposure to sunlight, or a commonly available alcohol-based fuel.",
          points: 0
        },
        {
          id: "Uncommon",
          name: "Uncommon Substance/Condition",
          description: "Substances could include needing to 'bathe' in a large bonfire, extensive repairs requiring easily scavenged parts, a custom fuel that takes time to distill, or an easily synthesized drug.",
          points: 5
        },
        {
          id: "Rare",
          name: "Rare Substance/Condition",
          description: "Substances could include extensive repairs requiring hard-to-find parts, exposure to a specific form of radiation, or a drug custom-made to keep you alive.",
          points: 10
        }
      ],
      negativeEffects: [
        {
          id: "PowerNegation",
          name: "Power Negation",
          description: "All your powers stop working until you can partake in your dependency.",
          points: 5
        },
        {
          id: "PhysicalWeakness",
          name: "Physical Weakness",
          description: "You suffer a disadvantage on Strength, Dexterity, Constitution checks and skill checks until you can partake in your dependency.",
          points: 5
        },
        {
          id: "IncapacitatingWeakness",
          name: "Incapacitating Weakness",
          description: "If you fail to meet your Dependency requirement, your maximum Stamina is reduced by 2d12 every hour until you reach 0 Stamina and fall unconscious or until you partake in your dependency.",
          points: 10
        },
        {
          id: "FatalWeakness",
          name: "Fatal Weakness",
          description: "If you fail to meet your Dependence requirement, you lose 1 wound every hour until you reach 0 wounds or until you partake of your dependency.",
          points: 15
        }
      ]
    }
  },
  "Dependent": {
    title: "Dependent",
    description: "There is someone you care about who depends on you for survival.",
    options: {
      dependentTypes: [
        {
          id: "Average",
          name: "Average Health",
          description: "Your Dependent can be a person of average health and ability, they are a survivor of the apocalypse and know how to get by.",
          points: 5
        },
        {
          id: "Weak",
          name: "Weak Health",
          description: "Your Dependent is weaker than the common survivor. While their mind may still be sharp, their body is aged, injured, or ravaged by illness.",
          points: 10
        },
        {
          id: "Frail",
          name: "Frail Health",
          description: "Your Dependent is of frail health. They may be blind, deaf, partially paralyzed, and so on. They depend on you for most of their needs.",
          points: 15
        }
      ]
    }
  },
  "Custom": {
    title: "Custom Weakness",
    description: "Create a custom weakness with your Editor-in-Chief's approval."
  }
};

// Define the point usage options
const POINT_USAGE_OPTIONS = [
  { value: "ability", label: "Ability Score Bonus" },
  { value: "power", label: "Power Score Bonus" },
  { value: "feat", label: "Bonus Feat" }
];

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
  const [showSecondNegativeEffect, setShowSecondNegativeEffect] = useState<boolean>(false);

  // Calculate total weakness points
  const calculatePoints = () => {
    const points = character.complications.reduce((total, complication) => {
      return total + (complication.points || 0);
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
      // Create a copy of the current complications array
      const updatedComplications = [...character.complications];
      
      // Add the new weakness
      updatedComplications.push({
        name: newWeakness.name,
        description: newWeakness.description,
        points: newWeakness.points,
        type: selectedWeaknessType
      });
      
      // Update the character
      updateCharacterField('complications', updatedComplications);
      
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
    const updatedComplications = [...character.complications];
    updatedComplications.splice(index, 1);
    updateCharacterField('complications', updatedComplications);
    calculatePoints();
  };

  // Handle weakness type selection
  const handleWeaknessTypeChange = (type: WeaknessType) => {
    setSelectedWeaknessType(type);
    
    // Reset the form
    setNewWeakness({
      type,
      name: WEAKNESSES[type].title,
      description: "",
      points: 0,
      details: {}
    });
    
    setShowSecondNegativeEffect(false);
  };

  // Handle substance type selection
  const handleSubstanceTypeChange = (substanceType: string) => {
    const selectedSubstance = WEAKNESSES[selectedWeaknessType as WeaknessType].options?.substance?.find(
      s => s.id === substanceType
    );
    
    if (selectedSubstance) {
      setNewWeakness({
        ...newWeakness,
        details: {
          ...newWeakness.details,
          substanceType: substanceType as "Common" | "Uncommon" | "Rare"
        },
        points: selectedSubstance.points + (newWeakness.details?.negativeEffect ? 
          WEAKNESSES[selectedWeaknessType as WeaknessType].options?.negativeEffects?.find(
            e => e.id === newWeakness.details?.negativeEffect
          )?.points || 0 : 0)
      });
    }
  };

  // Handle negative effect selection
  const handleNegativeEffectChange = (negativeEffect: string) => {
    const selectedEffect = WEAKNESSES[selectedWeaknessType as WeaknessType].options?.negativeEffects?.find(
      e => e.id === negativeEffect
    );
    
    if (selectedEffect) {
      setNewWeakness({
        ...newWeakness,
        details: {
          ...newWeakness.details,
          negativeEffect: negativeEffect as "PowerNegation" | "PhysicalWeakness" | "IncapacitatingWeakness" | "FatalWeakness"
        },
        points: (newWeakness.details?.substanceType ? 
          WEAKNESSES[selectedWeaknessType as WeaknessType].options?.substance?.find(
            s => s.id === newWeakness.details?.substanceType
          )?.points || 0 : 0) + selectedEffect.points
      });
      
      // Allow for a second negative effect
      setShowSecondNegativeEffect(true);
    }
  };

  // Handle second negative effect selection
  const handleSecondNegativeEffectChange = (negativeEffect: string) => {
    const selectedEffect = WEAKNESSES[selectedWeaknessType as WeaknessType].options?.negativeEffects?.find(
      e => e.id === negativeEffect
    );
    
    if (selectedEffect) {
      setNewWeakness({
        ...newWeakness,
        points: newWeakness.points + selectedEffect.points
      });
    }
  };

  // Handle secret level selection
  const handleSecretLevelChange = (secretLevel: string) => {
    const selectedLevel = WEAKNESSES[selectedWeaknessType as WeaknessType].options?.secretLevels?.find(
      l => l.id === secretLevel
    );
    
    if (selectedLevel) {
      setNewWeakness({
        ...newWeakness,
        details: {
          ...newWeakness.details,
          secretLevel: secretLevel as "Trivial" | "Serious" | "Severe"
        },
        points: selectedLevel.points
      });
    }
  };

  // Handle dependent type selection
  const handleDependentTypeChange = (dependentType: string) => {
    const selectedType = WEAKNESSES[selectedWeaknessType as WeaknessType].options?.dependentTypes?.find(
      t => t.id === dependentType
    );
    
    if (selectedType) {
      setNewWeakness({
        ...newWeakness,
        details: {
          ...newWeakness.details,
          dependentType: dependentType as "Average" | "Weak" | "Frail"
        },
        points: selectedType.points
      });
    }
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

  // Handle custom points assignment
  const handlePointsAssignment = () => {
    if (remainingWeaknessPoints <= 0) return;
    
    const updatedAllocations = [...allocations];
    
    // Logic for allocating points
    // This is a placeholder - you'll need to implement the actual logic based on your character data model
    
    setAllocations(updatedAllocations);
    calculatePoints();
  };

  // Check if we can add the current weakness
  const canAddWeakness = () => {
    if (!selectedWeaknessType) return false;
    
    // Basic check for Custom type
    if (selectedWeaknessType === "Custom") {
      return !!newWeakness.name && !!newWeakness.description && newWeakness.points > 0;
    }
    
    // Check for required fields based on weakness type
    switch (selectedWeaknessType) {
      case "Addiction":
        return !!newWeakness.details?.substanceType;
      case "DarkSecret":
        return !!newWeakness.details?.secretLevel && !!newWeakness.description;
      case "Dependence":
        return !!newWeakness.details?.substanceType && !!newWeakness.details?.negativeEffect && !!newWeakness.description;
      case "Dependent":
        return !!newWeakness.details?.dependentType && !!newWeakness.name && !!newWeakness.description;
      default:
        return false;
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
          <p>
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
              {character.complications.map((complication, index) => (
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
                {Object.entries(WEAKNESSES).map(([key, weakness]) => (
                  <SelectItem key={key} value={key}>
                    {weakness.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedWeaknessType && (
              <p className="text-sm text-gray-400 mt-1">
                {WEAKNESSES[selectedWeaknessType].description}
              </p>
            )}
          </div>
          
          {/* Weakness Details based on type */}
          {selectedWeaknessType && (
            <div className="space-y-4">
              {/* Addiction */}
              {selectedWeaknessType === "Addiction" && (
                <div>
                  <label className="block text-sm mb-1">Substance Type</label>
                  <Select 
                    onValueChange={handleSubstanceTypeChange}
                  >
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue placeholder="Select substance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEAKNESSES.Addiction.options?.substance?.map((substance) => (
                        <SelectItem key={substance.id} value={substance.id}>
                          {substance.name} ({substance.points} points)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {newWeakness.details?.substanceType && (
                    <p className="text-xs text-gray-400 mt-1">
                      {WEAKNESSES.Addiction.options?.substance?.find(s => s.id === newWeakness.details?.substanceType)?.description}
                    </p>
                  )}
                  
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
                  <Select 
                    onValueChange={handleSecretLevelChange}
                  >
                    <SelectTrigger className="bg-gray-700">
                      <SelectValue placeholder="Select secret level" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEAKNESSES.DarkSecret.options?.secretLevels?.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name} ({level.points} points)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {newWeakness.details?.secretLevel && (
                    <p className="text-xs text-gray-400 mt-1">
                      {WEAKNESSES.DarkSecret.options?.secretLevels?.find(l => l.id === newWeakness.details?.secretLevel)?.description}
                    </p>
                  )}
                  
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
                    <Select 
                      onValueChange={handleSubstanceTypeChange}
                    >
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select substance/condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAKNESSES.Dependence.options?.substance?.map((substance) => (
                          <SelectItem key={substance.id} value={substance.id}>
                            {substance.name} ({substance.points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newWeakness.details?.substanceType && (
                      <p className="text-xs text-gray-400 mt-1">
                        {WEAKNESSES.Dependence.options?.substance?.find(s => s.id === newWeakness.details?.substanceType)?.description}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Negative Effect</label>
                    <Select 
                      onValueChange={handleNegativeEffectChange}
                    >
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select negative effect" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAKNESSES.Dependence.options?.negativeEffects?.map((effect) => (
                          <SelectItem key={effect.id} value={effect.id}>
                            {effect.name} ({effect.points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newWeakness.details?.negativeEffect && (
                      <p className="text-xs text-gray-400 mt-1">
                        {WEAKNESSES.Dependence.options?.negativeEffects?.find(e => e.id === newWeakness.details?.negativeEffect)?.description}
                      </p>
                    )}
                  </div>
                  
                  {showSecondNegativeEffect && (
                    <div>
                      <div className="flex items-center">
                        <label className="block text-sm mb-1">Additional Negative Effect (Optional)</label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                                <Info className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-[250px]">
                                You can add a second negative effect to increase the points from this weakness.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <Select 
                        onValueChange={handleSecondNegativeEffectChange}
                      >
                        <SelectTrigger className="bg-gray-700">
                          <SelectValue placeholder="Select additional effect (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {WEAKNESSES.Dependence.options?.negativeEffects
                            ?.filter(effect => effect.id !== newWeakness.details?.negativeEffect)
                            .map((effect) => (
                              <SelectItem key={effect.id} value={effect.id}>
                                {effect.name} ({effect.points} points)
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
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
                    <Select 
                      onValueChange={handleDependentTypeChange}
                    >
                      <SelectTrigger className="bg-gray-700">
                        <SelectValue placeholder="Select dependent type" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEAKNESSES.Dependent.options?.dependentTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.points} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newWeakness.details?.dependentType && (
                      <p className="text-xs text-gray-400 mt-1">
                        {WEAKNESSES.Dependent.options?.dependentTypes?.find(t => t.id === newWeakness.details?.dependentType)?.description}
                      </p>
                    )}
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
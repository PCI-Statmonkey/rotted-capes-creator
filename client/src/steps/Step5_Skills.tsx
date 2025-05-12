import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";

// Define skill sets
interface SkillSet {
  name: string;
  points: number;
  skills: {
    name: string;
    focus?: string | string[] | boolean;
  }[];
  feats: string[];
  description?: string;
}

const SKILL_SETS: SkillSet[] = [
  {
    name: "Academic/Student",
    points: 6,
    skills: [
      { name: "Academics" },
      { name: "Academics", focus: ["Choose two fields of study"] },
      { name: "Athletics" },
      { name: "Linguistics" },
      { name: "Science" },
      { name: "Technology" }
    ],
    feats: ["Eclectic Knowledge"]
  },
  {
    name: "Athlete, Pro/Semi-Pro",
    points: 5,
    skills: [
      { name: "Academics" },
      { name: "Acrobatics" },
      { name: "Athletics" },
      { name: "Perception" }
    ],
    feats: ["Quick"]
  },
  {
    name: "Automobile Mechanic",
    points: 9,
    skills: [
      { name: "Athletics" },
      { name: "Basic Technology", focus: true },
      { name: "Engineering" },
      { name: "Engineering", focus: "Automobile Repair" }
    ],
    feats: ["Gearhead", "Technophile"]
  },
  {
    name: "Business Professional",
    points: 12,
    skills: [
      { name: "Academics" },
      { name: "Basic Technology" },
      { name: "Empathy", focus: true },
      { name: "Influence" },
      { name: "Influence", focus: ["Choose a field of study"] },
      { name: "Linguistics" }
    ],
    feats: ["Empathic Intuition", "Honeyed Tongue"]
  },
  {
    name: "Criminal",
    points: 6,
    skills: [
      { name: "Basic Technology" },
      { name: "Empathy" },
      { name: "Larceny", focus: true },
      { name: "Perception" },
      { name: "Stealth" }
    ],
    feats: ["Burglar"]
  },
  {
    name: "Computer Technician",
    points: 8,
    skills: [
      { name: "Engineering" },
      { name: "Engineering", focus: "Computers" },
      { name: "Engineering", focus: "Programming" },
      { name: "Technology" },
      { name: "Technology", focus: "Programming" },
      { name: "Technology", focus: "Computer Repair" }
    ],
    feats: ["Technological Savant", "Engineering Prodigy"]
  },
  {
    name: "Detective",
    points: 14,
    skills: [
      { name: "Academics" },
      { name: "Academics", focus: ["Law", "Criminology"] },
      { name: "Athletics" },
      { name: "Drive" },
      { name: "Basic Technology" },
      { name: "Empathy", focus: true },
      { name: "Investigation", focus: true },
      { name: "Perception" },
      { name: "Local Knowledge" }
    ],
    feats: ["Empathic Intuition", "Investigator"]
  },
  {
    name: "Doctor",
    points: 16,
    skills: [
      { name: "Academics" },
      { name: "Empathy" },
      { name: "Medicine" },
      { name: "Medicine", focus: ["Choose two fields of study"] },
      { name: "Perception" },
      { name: "Science", focus: "Biology" },
      { name: "Science", focus: ["Toxicology", "Virology"] },
      { name: "Technology" },
      { name: "Technology", focus: "Medical Technology" },
      { name: "Technology", focus: "Biotechnology" }
    ],
    feats: ["Healing Hands", "Technological Savant", "Scientific Mind"]
  },
  {
    name: "Ex-military",
    points: 12,
    skills: [
      { name: "Athletics" },
      { name: "Basic Technology" },
      { name: "Medicine" },
      { name: "Perception" },
      { name: "Outdoorsman" },
      { name: "Urban Survival" }
    ],
    feats: ["Learn Maneuver", "Learn Maneuver"]
  },
  {
    name: "Engineer",
    points: 11,
    skills: [
      { name: "Academics" },
      { name: "Basic Engineering", focus: true },
      { name: "Engineering" },
      { name: "Engineering", focus: ["Choose two fields of study"] },
      { name: "Science" },
      { name: "Technology" }
    ],
    feats: ["Engineering Prodigy", "Jury Rigging"]
  },
  {
    name: "Emergency Response",
    points: 7,
    skills: [
      { name: "Academics" },
      { name: "Athletics" },
      { name: "Empathy" },
      { name: "Medicine" },
      { name: "Medicine", focus: "EMT" },
      { name: "Medicine", focus: "Infectious Diseases" },
      { name: "Science" },
      { name: "Technology" }
    ],
    feats: ["Healing Hands"]
  },
  {
    name: "Law Enforcement",
    points: 6,
    skills: [
      { name: "Academics" },
      { name: "Athletics" },
      { name: "Drive" },
      { name: "Perception" },
      { name: "Local Knowledge", focus: true }
    ],
    feats: ["Seasoned Survivor"]
  },
  {
    name: "Occultist",
    points: 6,
    skills: [
      { name: "Academics" },
      { name: "Empathy" },
      { name: "Investigation" },
      { name: "Linguistics" },
      { name: "Occult", focus: true },
      { name: "Perception" }
    ],
    feats: ["Occultist"]
  },
  {
    name: "Public Relations/Con Artist",
    points: 9,
    skills: [
      { name: "Empathy" },
      { name: "Influence", focus: true },
      { name: "Larceny" },
      { name: "Linguistics" },
      { name: "Linguistics", focus: ["Choose one field of study"] }
    ],
    feats: ["Honeyed Tongue", "Polyglot"]
  },
  {
    name: "Scientist",
    points: 11,
    skills: [
      { name: "Basic Technology" },
      { name: "Academics", focus: ["Choose two fields of study"] },
      { name: "Investigation" },
      { name: "Science", focus: ["Choose two fields of study"] },
      { name: "Technology" },
      { name: "Perception" }
    ],
    feats: ["Eclectic Knowledge", "Scientific Mind"]
  },
  {
    name: "Spy/Assassin",
    points: 13,
    skills: [
      { name: "Athletics" },
      { name: "Acrobatics" },
      { name: "Investigation" },
      { name: "Larceny" },
      { name: "Perception" },
      { name: "Stealth", focus: true },
      { name: "Technology", focus: "Computer Hacking" }
    ],
    feats: ["Hacker", "Stealthy"]
  },
  {
    name: "Street Magician",
    points: 10,
    skills: [
      { name: "Escape Artist" },
      { name: "Influence" },
      { name: "Prestidigitation" },
      { name: "Performance" }
    ],
    feats: ["Escape Artist Extraordinaire", "Street Magic"]
  },
  {
    name: "Survivalist",
    points: 12,
    skills: [
      { name: "Athletics" },
      { name: "Animal Handling" },
      { name: "Drive" },
      { name: "Perception" },
      { name: "Outdoorsman", focus: true },
      { name: "Urban Survival", focus: true }
    ],
    feats: ["Hunter", "I've Done Alright for Myself"]
  }
];

// All available skills
const ALL_SKILLS = [
  { name: "Academics", hasFieldsOfStudy: true },
  { name: "Acrobatics", hasFieldsOfStudy: true },
  { name: "Animal Handling", hasFieldsOfStudy: true },
  { name: "Athletics", hasFieldsOfStudy: true },
  { name: "Basic Engineering", hasFieldsOfStudy: false },
  { name: "Basic Technology", hasFieldsOfStudy: false },
  { name: "Drive", hasFieldsOfStudy: true },
  { name: "Empathy", hasFieldsOfStudy: false },
  { name: "Engineering", hasFieldsOfStudy: true },
  { name: "Escapee Artist", hasFieldsOfStudy: false },
  { name: "Influence", hasFieldsOfStudy: true },
  { name: "Investigation", hasFieldsOfStudy: false },
  { name: "Larceny", hasFieldsOfStudy: false },
  { name: "Linguistics", hasFieldsOfStudy: true },
  { name: "Local Knowledge", hasFieldsOfStudy: true },
  { name: "Medicine", hasFieldsOfStudy: true },
  { name: "Occult", hasFieldsOfStudy: true },
  { name: "Outdoorsman", hasFieldsOfStudy: true },
  { name: "Perception", hasFieldsOfStudy: false },
  { name: "Performance", hasFieldsOfStudy: true },
  { name: "Pilot", hasFieldsOfStudy: true },
  { name: "Prestidigitation", hasFieldsOfStudy: true },
  { name: "Scavenge", hasFieldsOfStudy: true },
  { name: "Science", hasFieldsOfStudy: true },
  { name: "Stealth", hasFieldsOfStudy: false },
  { name: "Technology", hasFieldsOfStudy: true },
  { name: "Urban Survival", hasFieldsOfStudy: true }
];

// Available feats
const AVAILABLE_FEATS = [
  "Burglar",
  "Eclectic Knowledge",
  "Empathic Intuition",
  "Engineering Prodigy",
  "Escape Artist Extraordinaire",
  "Gearhead",
  "Hacker",
  "Healing Hands",
  "Honeyed Tongue",
  "Hunter",
  "I've Done Alright for Myself",
  "Investigator",
  "Jury Rigging",
  "Learn Maneuver",
  "Occultist",
  "Polyglot",
  "Quick",
  "Scientific Mind",
  "Seasoned Survivor",
  "Stealthy",
  "Street Magic",
  "Technological Savant",
  "Technophile"
];

// Basic starting skill options
const BASIC_STARTING_SKILLS = [
  "Athletics",
  "Drive",
  "Local Knowledge",
  "Basic Technology",
  "Basic Engineering",
  "Urban Survival"
];

// Define interface for selected skills, skill focus, etc.
interface SelectedSkill {
  name: string;
  focus?: string | boolean;
  source: "starting" | "individual" | "skillSet";
  skillSetName?: string;
}

interface SelectedFeat {
  name: string;
  source: "starting" | "purchased" | "skillSet";
  skillSetName?: string;
}

interface SelectedManeuver {
  name: string;
}

export default function Step5_Skills() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [availablePoints, setAvailablePoints] = useState(20);
  const [startingSkills, setStartingSkills] = useState<string[]>([]);
  const [startingFeat, setStartingFeat] = useState<string>("");
  const [startingManeuver, setStartingManeuver] = useState<string>("");
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>([]);
  const [individualSkills, setIndividualSkills] = useState<string[]>([]);
  const [purchasedFeats, setPurchasedFeats] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("skillSets");

  // Get all skills from chosen skill sets
  const getSkillsFromSelectedSkillSets = (): SelectedSkill[] => {
    return selectedSkillSets.flatMap(setName => {
      const skillSet = SKILL_SETS.find(set => set.name === setName);
      if (!skillSet) return [];
      
      return skillSet.skills.map(skill => ({
        name: skill.name,
        focus: Array.isArray(skill.focus) ? skill.focus[0] : skill.focus,
        source: "skillSet" as const,
        skillSetName: setName
      }));
    });
  };

  // Get all feats from chosen skill sets
  const getFeatsFromSelectedSkillSets = (): SelectedFeat[] => {
    return selectedSkillSets.flatMap(setName => {
      const skillSet = SKILL_SETS.find(set => set.name === setName);
      if (!skillSet) return [];
      
      return skillSet.feats.map(feat => ({
        name: feat,
        source: "skillSet" as const,
        skillSetName: setName
      }));
    });
  };

  // Check if a skill is selected multiple times, granting skill focus
  const getSkillOccurrences = (skillName: string): { count: number; sources: string[] } => {
    const allSkills = [
      ...startingSkills.map(s => ({ name: s, source: "starting" as const })),
      ...individualSkills.map(s => ({ name: s, source: "individual" as const })),
      ...getSkillsFromSelectedSkillSets().filter(s => s.name === skillName)
    ];
    
    const filteredSkills = allSkills.filter(s => s.name === skillName);
    return {
      count: filteredSkills.length,
      sources: filteredSkills.map(s => s.source)
    };
  };

  // Check if a feat is selected multiple times
  const getFeatOccurrences = (featName: string): { count: number; sources: string[] } => {
    const allFeats = [
      ...(startingFeat === featName ? [{ name: featName, source: "starting" as const }] : []),
      ...purchasedFeats.filter(f => f === featName).map(f => ({ name: f, source: "purchased" as const })),
      ...getFeatsFromSelectedSkillSets().filter(f => f.name === featName)
    ];
    
    return {
      count: allFeats.length,
      sources: allFeats.map(s => s.source)
    };
  };

  // Calculate current point usage
  const calculatePointsUsed = () => {
    const skillSetPoints = selectedSkillSets.reduce((total, setName) => {
      const set = SKILL_SETS.find(s => s.name === setName);
      return total + (set?.points || 0);
    }, 0);
    
    const individualSkillPoints = individualSkills.length;
    const featPoints = purchasedFeats.length * 5;
    
    return skillSetPoints + individualSkillPoints + featPoints;
  };

  // Update available points when selections change
  useEffect(() => {
    const pointsUsed = calculatePointsUsed();
    setAvailablePoints(20 - pointsUsed);
  }, [selectedSkillSets, individualSkills, purchasedFeats]);

  // Handle skill set selection
  const toggleSkillSet = (setName: string) => {
    setSelectedSkillSets(prev => {
      const isCurrentlySelected = prev.includes(setName);
      
      // If already selected, remove it
      if (isCurrentlySelected) {
        return prev.filter(name => name !== setName);
      }
      
      // Check if we can add another skill set (max 2, or 3 for highly trained heroes)
      const isHighlyTrained = character.origin === "Highly Trained";
      const maxSets = isHighlyTrained ? 3 : 2;
      
      if (prev.length >= maxSets) {
        return prev;
      }
      
      // Check if we have enough points
      const set = SKILL_SETS.find(s => s.name === setName);
      if (!set) return prev;
      
      const currentUsedPoints = calculatePointsUsed();
      const wouldExceedBudget = currentUsedPoints + set.points > 20;
      
      if (wouldExceedBudget) {
        return prev;
      }
      
      return [...prev, setName];
    });
  };

  // Handle individual skill selection
  const toggleIndividualSkill = (skillName: string) => {
    setIndividualSkills(prev => {
      const isCurrentlySelected = prev.includes(skillName);
      
      // If already selected, remove it
      if (isCurrentlySelected) {
        return prev.filter(name => name !== skillName);
      }
      
      // Check if we have enough points
      if (availablePoints < 1) {
        return prev;
      }
      
      return [...prev, skillName];
    });
  };

  // Handle feat purchase
  const toggleFeat = (featName: string) => {
    setPurchasedFeats(prev => {
      const isCurrentlySelected = prev.includes(featName);
      
      // If already selected, remove it
      if (isCurrentlySelected) {
        return prev.filter(name => name !== featName);
      }
      
      // Check if we have enough points
      if (availablePoints < 5) {
        return prev;
      }
      
      return [...prev, featName];
    });
  };

  // Handle starting skill selection
  const toggleStartingSkill = (skillName: string) => {
    setStartingSkills(prev => {
      const isCurrentlySelected = prev.includes(skillName);
      
      // If already selected, remove it
      if (isCurrentlySelected) {
        return prev.filter(name => name !== skillName);
      }
      
      // Check if we can add another skill (max 2)
      if (prev.length >= 2) {
        return prev;
      }
      
      return [...prev, skillName];
    });
  };

  // Format skill name for display
  const formatSkillName = (name: string): string => {
    return name.split(/(?=[A-Z])/).join(' ');
  };

  // Check if user can proceed to next step
  const canProceed = () => {
    return startingSkills.length === 2 && 
           startingFeat !== "" && 
           startingManeuver !== "" && 
           availablePoints >= 0;
  };

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(4);
  };

  // Handle going to next step
  const handleContinue = () => {
    if (!canProceed()) return;
    
    // Convert selected skills to the format expected by CharacterContext
    const allSelectedSkills = [
      ...startingSkills.map(name => ({
        name,
        ability: "strength", // Default, would need to be properly assigned
        ranks: 1,
        trained: true,
      })),
      ...individualSkills.map(name => ({
        name,
        ability: "strength", // Default, would need to be properly assigned
        ranks: 1,
        trained: true,
      })),
      ...getSkillsFromSelectedSkillSets().map(skill => ({
        name: skill.name,
        ability: "strength", // Default, would need to be properly assigned
        ranks: 1,
        trained: true,
        specialization: skill.focus,
      }))
    ];
    
    // Combine all selected feats
    const allSelectedFeats = [
      { name: startingFeat },
      ...purchasedFeats.map(name => ({ name })),
      ...getFeatsFromSelectedSkillSets().map(feat => ({ name: feat.name }))
    ];
    
    // Update character field with selections
    updateCharacterField('skills', allSelectedSkills);
    updateCharacterField('feats', allSelectedFeats);
    updateCharacterField('maneuvers', [{ name: startingManeuver }]);
    
    // Track event in analytics
    trackEvent('skills_selected', 'character', 
      `Skills: ${allSelectedSkills.length}, Feats: ${allSelectedFeats.length}`
    );
    
    // Move to the next step
    setCurrentStep(6);
  };

  return (
    <motion.div 
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-comic text-3xl text-accent tracking-wide">Step 5: Skills & Feats</h2>
        <p className="text-gray-300 mt-2">
          All heroes start with 2 basic skills, 1 feat, and 1 maneuver. You also have 20 points to spend on additional skills, skill sets, and feats.
        </p>
        <p className="text-gray-300 mt-1 text-sm">
          <span className="text-accent">Skill Sets</span> are collections of related skills and feats available at a discount.
          You can purchase up to {character.origin === "Highly Trained" ? "3" : "2"} skill sets.
        </p>
      </div>

      <div className="space-y-6">
        {/* Points summary */}
        <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div>
            <span className="text-gray-400">Points Available:</span>
            <span className={`ml-2 font-bold ${availablePoints < 0 ? 'text-red-500' : 'text-accent'}`}>
              {availablePoints}
            </span>
            <span className="text-gray-400"> / 20</span>
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
                  <h4 className="font-bold">Spending Points</h4>
                  <ul className="text-xs space-y-1">
                    <li>Individual Skills: 1 point each</li>
                    <li>Feats: 5 points each</li>
                    <li>Skill Sets: Varies (listed with each set)</li>
                    <li>Maximum {character.origin === "Highly Trained" ? "3" : "2"} skill sets allowed</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Starting skills & feats selection */}
        <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-comic text-xl text-accent">Starting Choices</h3>
          <p className="text-sm text-gray-300 mb-4">All heroes start with these basic selections.</p>
          
          <div className="space-y-6">
            {/* Starting skills */}
            <div>
              <Label className="text-md font-medium mb-2 block">Select 2 Starting Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {BASIC_STARTING_SKILLS.map(skill => (
                  <div 
                    key={skill}
                    className={`
                      rounded-md p-2 border ${startingSkills.includes(skill) 
                        ? 'bg-accent/10 border-accent' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      } cursor-pointer transition-colors
                      ${startingSkills.length >= 2 && !startingSkills.includes(skill) ? 'opacity-50' : ''}
                    `}
                    onClick={() => toggleStartingSkill(skill)}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        {startingSkills.includes(skill) && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <span>{formatSkillName(skill)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Starting feat */}
            <div>
              <Label className="text-md font-medium mb-2 block">Select 1 Starting Feat</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {AVAILABLE_FEATS.slice(0, 10).map(feat => (
                  <div 
                    key={feat}
                    className={`
                      rounded-md p-2 border ${startingFeat === feat 
                        ? 'bg-accent/10 border-accent' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      } cursor-pointer transition-colors
                      ${startingFeat && startingFeat !== feat ? 'opacity-50' : ''}
                    `}
                    onClick={() => setStartingFeat(feat)}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        {startingFeat === feat && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <span>{feat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Starting maneuver */}
            <div>
              <Label className="text-md font-medium mb-2 block">Select 1 Starting Maneuver</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {["Defensive Attack", "Defensive Stance", "Power Attack", "Grab", "Trip"].map(maneuver => (
                  <div 
                    key={maneuver}
                    className={`
                      rounded-md p-2 border ${startingManeuver === maneuver 
                        ? 'bg-accent/10 border-accent' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      } cursor-pointer transition-colors
                      ${startingManeuver && startingManeuver !== maneuver ? 'opacity-50' : ''}
                    `}
                    onClick={() => setStartingManeuver(maneuver)}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        {startingManeuver === maneuver && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <span>{maneuver}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different purchase options */}
        <Tabs defaultValue="skillSets" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="skillSets">Skill Sets</TabsTrigger>
            <TabsTrigger value="individualSkills">Individual Skills</TabsTrigger>
            <TabsTrigger value="feats">Additional Feats</TabsTrigger>
          </TabsList>
          
          {/* Skill Sets Tab */}
          <TabsContent value="skillSets" className="space-y-4 mt-4">
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
              <p className="text-sm mb-2">
                You can purchase up to {character.origin === "Highly Trained" ? "3" : "2"} skill sets.
                Skill sets give you multiple skills and feats at a discount.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {SKILL_SETS.map(skillSet => {
                  const isSelected = selectedSkillSets.includes(skillSet.name);
                  const canBeSelected = isSelected || (
                    selectedSkillSets.length < (character.origin === "Highly Trained" ? 3 : 2) && 
                    availablePoints >= skillSet.points
                  );
                  
                  return (
                    <div 
                      key={skillSet.name}
                      className={`
                        border rounded-lg p-3 ${isSelected 
                          ? 'bg-accent/10 border-accent' 
                          : 'bg-gray-700 border-gray-600'
                        } ${!canBeSelected && !isSelected ? 'opacity-50' : ''}
                        ${canBeSelected ? 'cursor-pointer hover:border-gray-400' : 'cursor-not-allowed'}
                      `}
                      onClick={() => canBeSelected ? toggleSkillSet(skillSet.name) : null}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{skillSet.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-900 px-2 py-1 rounded-full">{skillSet.points} points</span>
                          {isSelected && (
                            <span className="flex items-center justify-center bg-accent text-white h-5 w-5 rounded-full">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillSet.skills.map((skill, idx) => (
                              <span 
                                key={`${skill.name}-${idx}`}
                                className={`
                                  px-2 py-0.5 rounded-full text-xs
                                  ${skill.focus ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-900 text-gray-300'}
                                `}
                              >
                                {skill.name}{skill.focus === true ? " •" : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">Feats:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillSet.feats.map(feat => (
                              <span 
                                key={feat}
                                className="bg-gray-900 text-gray-300 px-2 py-0.5 rounded-full text-xs"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          {/* Individual Skills Tab */}
          <TabsContent value="individualSkills" className="space-y-4 mt-4">
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
              <p className="text-sm mb-2">
                Each individual skill costs 1 point. You may choose as many as you can afford.
                Skills with an asterisk (*) have fields of study.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                {ALL_SKILLS.map(skill => {
                  const isSelected = individualSkills.includes(skill.name);
                  const canBeSelected = isSelected || availablePoints >= 1;
                  const occurrences = getSkillOccurrences(skill.name);
                  const hasFocus = occurrences.count > 1;
                  
                  return (
                    <div 
                      key={skill.name}
                      className={`
                        border rounded-lg p-2 ${isSelected 
                          ? 'bg-accent/10 border-accent' 
                          : 'bg-gray-700 border-gray-600'
                        } ${!canBeSelected && !isSelected ? 'opacity-50' : ''}
                        ${canBeSelected ? 'cursor-pointer hover:border-gray-400' : 'cursor-not-allowed'}
                      `}
                      onClick={() => canBeSelected ? toggleIndividualSkill(skill.name) : null}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span>{formatSkillName(skill.name)}</span>
                          {skill.hasFieldsOfStudy && <span className="text-accent ml-1">*</span>}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      
                      {hasFocus && (
                        <div className="mt-1 text-xs text-green-400 flex items-center">
                          <span className="mr-1">Focus!</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="text-xs">
                                <p>This skill appears multiple times from different sources, granting you skill focus!</p>
                                <p className="mt-1">Sources: {occurrences.sources.join(', ')}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          {/* Additional Feats Tab */}
          <TabsContent value="feats" className="space-y-4 mt-4">
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
              <p className="text-sm mb-2">
                Each feat costs 5 points. You may choose as many as you can afford.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {AVAILABLE_FEATS.map(feat => {
                  const isSelected = purchasedFeats.includes(feat);
                  const canBeSelected = isSelected || availablePoints >= 5;
                  const occurrences = getFeatOccurrences(feat);
                  const isDuplicate = occurrences.count > 1;
                  
                  return (
                    <div 
                      key={feat}
                      className={`
                        border rounded-lg p-2 ${isSelected 
                          ? 'bg-accent/10 border-accent' 
                          : isDuplicate && !isSelected 
                            ? 'bg-yellow-900/20 border-yellow-800' 
                            : 'bg-gray-700 border-gray-600'
                        } ${!canBeSelected && !isSelected ? 'opacity-50' : ''}
                        ${canBeSelected && !isDuplicate ? 'cursor-pointer hover:border-gray-400' : isDuplicate && !isSelected ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                      `}
                      onClick={() => canBeSelected && (!isDuplicate || isSelected) ? toggleFeat(feat) : null}
                    >
                      <div className="flex justify-between items-center">
                        <span>{feat}</span>
                        {isSelected ? (
                          <Check className="h-4 w-4 text-accent" />
                        ) : isDuplicate && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-yellow-500">
                                <Info className="h-4 w-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="text-xs">
                                <p>This feat is already included in your selection.</p>
                                <p className="mt-1">Source: {occurrences.sources.join(', ')}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selection summary */}
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
          <h3 className="font-medium mb-3">Your Current Selections</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-gray-400">Starting Skills:</h4>
              {startingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {startingSkills.map(skill => (
                    <span key={skill} className="bg-gray-700 text-white px-2 py-1 rounded-full">
                      {formatSkillName(skill)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None selected yet</p>
              )}
            </div>
            
            <div>
              <h4 className="text-gray-400">Starting Feat:</h4>
              {startingFeat ? (
                <span className="bg-gray-700 text-white px-2 py-1 rounded-full">
                  {startingFeat}
                </span>
              ) : (
                <p className="text-gray-500 italic">None selected yet</p>
              )}
            </div>
            
            <div>
              <h4 className="text-gray-400">Starting Maneuver:</h4>
              {startingManeuver ? (
                <span className="bg-gray-700 text-white px-2 py-1 rounded-full">
                  {startingManeuver}
                </span>
              ) : (
                <p className="text-gray-500 italic">None selected yet</p>
              )}
            </div>
            
            {selectedSkillSets.length > 0 && (
              <div>
                <h4 className="text-gray-400">Selected Skill Sets:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSkillSets.map(setName => (
                    <span key={setName} className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center">
                      {setName}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-gray-600 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkillSet(setName);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {individualSkills.length > 0 && (
              <div>
                <h4 className="text-gray-400">Individual Skills:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {individualSkills.map(skill => (
                    <span key={skill} className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center">
                      {formatSkillName(skill)}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-gray-600 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIndividualSkill(skill);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {purchasedFeats.length > 0 && (
              <div>
                <h4 className="text-gray-400">Additional Feats:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {purchasedFeats.map(feat => (
                    <span key={feat} className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center">
                      {feat}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 ml-1 hover:bg-gray-600 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFeat(feat);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            disabled={!canProceed()}
          >
            Next <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// Interface for archetype data 
interface ArchetypeData {
  name: string;
  description: string;
  keyAbilities: string[]; // Key abilities for this archetype
  specialAbility: string; // Special ability that comes with the archetype
  trainedSkill: string; // Skill training that comes with the archetype
  image: string; // Image path 
}

export default function Step3_Archetype() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [selectedArchetype, setSelectedArchetype] = useState<string>(character.archetype || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedArchetype) {
      updateCharacterField('archetype', selectedArchetype);
      
      // Track the selection in analytics
      trackEvent('archetype_selected', 'character', selectedArchetype);
      
      // Move to the next step (Abilities)
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(2);
  };

  // Archetype data from the rulebook
  const archetypesData: ArchetypeData[] = [
    {
      name: "Andromorph",
      description: "You are an animal/human hybrid or super-evolved animal. Your feral senses enable you to detect zombies before they detect you.",
      keyAbilities: ["Strength", "Dexterity"],
      specialAbility: "Beast Within: +2 power score bonus to any one power on the typical powers list",
      trainedSkill: "Outdoorsman",
      image: "https://placehold.co/400x225/065f46/ffffff?text=Andromorph"
    },
    {
      name: "Blaster",
      description: "You excel at blasting people from a distance. A handy attribute when facing down a pack of zombies or super zombies without range powers.",
      keyAbilities: ["Dexterity", "Charisma"],
      specialAbility: "Marksman: +2 power score bonus to any one power on the typical powers list",
      trainedSkill: "Athletics",
      image: "https://placehold.co/400x225/ea580c/ffffff?text=Blaster"
    },
    {
      name: "Brawler",
      description: "You like to get into the thick of it! You get in the midst of the action, right between the chattering teeth and ripping claws... right where you like it.",
      keyAbilities: ["Strength", "Dexterity", "Constitution"],
      specialAbility: "Scrapper: Choice between the Martial Arts feat and the Weapon Master feat",
      trainedSkill: "Athletics",
      image: "https://placehold.co/400x225/991b1b/ffffff?text=Brawler"
    },
    {
      name: "Controller",
      description: "You have the ability to control something or someone. As a telepath, you survive by wit and guile. As a kinetic, you crush or throw Zombies out of your way.",
      keyAbilities: ["Wisdom", "Charisma"],
      specialAbility: "Manipulator: +2 power score bonus to any one power on the typical powers list",
      trainedSkill: "Influence",
      image: "https://placehold.co/400x225/4f46e5/ffffff?text=Controller"
    },
    {
      name: "Infiltrator",
      description: "Most people refer to your type as 'ghosts'; always slipping in, out, or through and always one step ahead of trouble. Maybe you walk through walls or can simply disappear.",
      keyAbilities: ["Dexterity", "Intelligence"],
      specialAbility: "Ghost: Gain the Stealthy feat for free",
      trainedSkill: "Stealth",
      image: "https://placehold.co/400x225/7c3aed/ffffff?text=Infiltrator"
    },
    {
      name: "Heavy",
      description: "Some people refer to you as a 'shaker' because when you throw it down, people feel it blocks away. You're stronger, tougher, and bigger... much bigger.",
      keyAbilities: ["Strength", "Constitution"],
      specialAbility: "Relentless: Gain the Toughness feat",
      trainedSkill: "Athletics",
      image: "https://placehold.co/400x225/0284c7/ffffff?text=Heavy"
    },
    {
      name: "Transporter",
      description: "You possess the ability to move from place to place with ease. Perhaps you're a flyer or a speedster, or the rarest of Transporters: a Teleporter.",
      keyAbilities: ["Dexterity", "Wisdom"],
      specialAbility: "In and Out: +2 power score bonus to any one power on the typical powers list",
      trainedSkill: "Athletics",
      image: "https://placehold.co/400x225/db2777/ffffff?text=Transporter"
    }
  ];

  return (
    <motion.div 
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-display text-3xl text-red-500 tracking-wide">Step 3: Character Archetype</h2>
        <p className="text-gray-300 mt-2">Choose an archetype that defines your hero's role and fighting style.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-6">
          Error loading archetypes: {error}. Please try again later.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archetypesData.map((archetype) => (
              <Card 
                key={archetype.name}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-accent/50 overflow-hidden",
                  selectedArchetype === archetype.name ? "border-2 border-accent shadow-lg" : "",
                  selectedArchetype && selectedArchetype !== archetype.name ? "opacity-50" : ""
                )}
                onClick={() => setSelectedArchetype(archetype.name)}
              >
                {/* Archetype Image */}
                <div className="relative">
                  <img 
                    src={archetype.image} 
                    alt={`${archetype.name} Archetype`} 
                    className="w-full h-[160px] object-cover"
                  />
                  {/* Selected indicator overlay */}
                  {selectedArchetype === archetype.name && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-1 shadow-md">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="font-comic text-xl">{archetype.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4 font-comic-light">{archetype.description}</p>
                  
                  <div className="space-y-4">
                    {/* Ability Score Bonus */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Ability Bonus:</h4>
                      <div className="flex flex-wrap gap-2">
                        {archetype.keyAbilities.map((ability, index) => (
                          <Badge 
                            key={index}
                            variant={selectedArchetype === archetype.name ? "default" : "outline"} 
                            className="font-medium"
                          >
                            +1 {ability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Special Ability */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-300">Special Ability:</h4>
                      <p className="text-gray-400 text-xs font-comic-light">{archetype.specialAbility}</p>
                    </div>
                    
                    {/* Trained Skill */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-300">Trained In:</h4>
                      <Badge
                        variant={selectedArchetype === archetype.name ? "secondary" : "outline"}
                        className="font-medium"
                      >
                        {archetype.trainedSkill}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              disabled={!selectedArchetype}
            >
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
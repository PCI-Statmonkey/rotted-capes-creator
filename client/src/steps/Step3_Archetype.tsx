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

  // Enhanced archetype data with images and key abilities
  const archetypesData: ArchetypeData[] = [
    {
      name: "Bruiser",
      description: "Physically powerful character focused on strength and toughness. Excels at close combat and dealing/taking damage.",
      keyAbilities: ["Strength", "Constitution"],
      image: "https://placehold.co/400x225/991b1b/ffffff?text=Bruiser"
    },
    {
      name: "Speedster",
      description: "Super-fast character with lightning reflexes. Masters of mobility, evasion, and striking multiple targets.",
      keyAbilities: ["Dexterity", "Constitution"],
      image: "https://placehold.co/400x225/db2777/ffffff?text=Speedster"
    },
    {
      name: "Blaster",
      description: "Ranged damage specialist with destructive powers. Excellent at attacking from a distance with various energy types.",
      keyAbilities: ["Dexterity", "Intelligence"],
      image: "https://placehold.co/400x225/ea580c/ffffff?text=Blaster"
    },
    {
      name: "Defender",
      description: "Protective character with abilities focused on shielding and supporting allies. Specialists in damage mitigation.",
      keyAbilities: ["Constitution", "Wisdom"],
      image: "https://placehold.co/400x225/0284c7/ffffff?text=Defender"
    },
    {
      name: "Gadgeteer",
      description: "Tech-focused character with an arsenal of devices and tools. Adaptable problem-solvers with a tool for every situation.",
      keyAbilities: ["Intelligence", "Dexterity"],
      image: "https://placehold.co/400x225/7c3aed/ffffff?text=Gadgeteer"
    },
    {
      name: "Mentalist",
      description: "Psychic character with powers of the mind. Masters of mental manipulation, telepathy, and psychokinesis.",
      keyAbilities: ["Wisdom", "Charisma"],
      image: "https://placehold.co/400x225/4f46e5/ffffff?text=Mentalist"
    },
    {
      name: "Mastermind",
      description: "Strategic genius with enhanced intelligence. Excel at planning, invention, and outsmarting opponents.",
      keyAbilities: ["Intelligence", "Charisma"],
      image: "https://placehold.co/400x225/0f766e/ffffff?text=Mastermind"
    },
    {
      name: "Shapeshifter",
      description: "Adaptable character who can change form. Specializes in infiltration, disguise, and versatile combat forms.",
      keyAbilities: ["Constitution", "Charisma"],
      image: "https://placehold.co/400x225/475569/ffffff?text=Shapeshifter"
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
        <h2 className="font-comic text-3xl text-accent tracking-wide">Step 3: Character Archetype</h2>
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
                  selectedArchetype === archetype.name ? "border-2 border-accent shadow-lg" : ""
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
                  <p className="text-gray-400 text-sm mb-4">{archetype.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Key Abilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {archetype.keyAbilities.map((ability, index) => (
                        <Badge 
                          key={index}
                          variant={selectedArchetype === archetype.name ? "default" : "outline"} 
                          className="font-medium"
                        >
                          {ability}
                        </Badge>
                      ))}
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
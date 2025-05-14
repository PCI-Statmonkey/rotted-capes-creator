import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCharacter } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";

// Interface for origin data with ability bonuses
interface OriginData {
  name: string;
  description: string;
  abilityBonuses: {
    ability: string;
    bonus: number;
  }[];
  image?: string; // Optional image path
}

export default function Step2_Origin() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [selectedOrigin, setSelectedOrigin] = useState<string>(character.origin || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedOrigin) {
      updateCharacterField('origin', selectedOrigin);
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  // Enhanced origin data with ability bonuses and placeholder images
  const originsData: OriginData[] = [
    {
      name: "Super-Human",
      description: "Born with extraordinary abilities that manifest during adolescence or under stress.",
      abilityBonuses: [
        { ability: "Strength", bonus: 2 },
        { ability: "Constitution", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/6d28d9/ffffff?text=Super-Human"
    },
    {
      name: "Tech Hero",
      description: "Relies on advanced technology and gadgets for superheroic abilities.",
      abilityBonuses: [
        { ability: "Intelligence", bonus: 2 },
        { ability: "Dexterity", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/0284c7/ffffff?text=Tech+Hero"
    },
    {
      name: "Mystic",
      description: "Draws power from arcane sources, ancient rituals, or otherworldly entities.",
      abilityBonuses: [
        { ability: "Wisdom", bonus: 2 },
        { ability: "Charisma", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/a21caf/ffffff?text=Mystic"
    },
    {
      name: "Highly Trained",
      description: "No inherent powers, but has achieved peak human condition through intense training.",
      abilityBonuses: [
        { ability: "Dexterity", bonus: 2 },
        { ability: "Wisdom", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/b45309/ffffff?text=Highly+Trained"
    },
    {
      name: "Alien",
      description: "Extraterrestrial being with physiological differences that grant special abilities.",
      abilityBonuses: [
        { ability: "Constitution", bonus: 2 },
        { ability: "Intelligence", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/047857/ffffff?text=Alien"
    },
    {
      name: "Demi-God",
      description: "Descendant of divine beings, bestowed with supernatural powers and abilities.",
      abilityBonuses: [
        { ability: "Charisma", bonus: 2 },
        { ability: "Strength", bonus: 1 }
      ],
      image: "https://placehold.co/400x225/be123c/ffffff?text=Demi-God"
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
        <h2 className="font-comic text-3xl text-accent tracking-wide">Step 2: Character Origin</h2>
        <p className="text-gray-300 mt-2">Choose your character's power source or origin.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-6">
          Error loading origins: {error}. Please try again later.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {originsData.map((origin) => (
              <Card 
                key={origin.name}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-accent/50 overflow-hidden",
                  selectedOrigin === origin.name ? "border-2 border-accent shadow-lg" : ""
                )}
                onClick={() => setSelectedOrigin(origin.name)}
              >
                {/* Origin Image */}
                <div className="relative">
                  <img 
                    src={origin.image} 
                    alt={`${origin.name} Origin`} 
                    className="w-full h-[160px] object-cover"
                  />
                  {/* Selected indicator overlay */}
                  {selectedOrigin === origin.name && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-1 shadow-md">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="font-comic text-xl">{origin.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{origin.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Ability Bonuses:</h4>
                    <div className="flex flex-wrap gap-2">
                      {origin.abilityBonuses.map((bonus, index) => (
                        <Badge 
                          key={index}
                          variant={selectedOrigin === origin.name ? "default" : "outline"} 
                          className="font-medium"
                        >
                          {bonus.ability} +{bonus.bonus}
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
              disabled={!selectedOrigin}
            >
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

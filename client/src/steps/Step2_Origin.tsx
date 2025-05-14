import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCharacter } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";

// Interface for origin data with ability bonuses and special features
interface OriginData {
  name: string;
  description: string;
  abilityBonuses: {
    ability: string;
    bonus: number;
  }[];
  uniqueAdvantage: string; // Special advantage that comes with the origin
  uniqueDisadvantage: string; // Special disadvantage that comes with the origin
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

  // Origin data from the rulebook
  const originsData: OriginData[] = [
    {
      name: "Alien",
      description: "You are not of this world. Whether you hail from a distant planet, are a member of an extraterrestrial race, or from another dimension, your origins lie beyond.",
      abilityBonuses: [
        { ability: "Strength", bonus: 2 }
      ],
      uniqueAdvantage: "Alien Resilience: Your alien physiology grants you natural resistance to physical harm. You have an innate Damage Resistance (DR) of 1 against all physical damage.",
      uniqueDisadvantage: "Cultural Misunderstanding: Your alien nature and cultural background may lead to misunderstandings and difficulties in interacting with humans.",
      image: "https://placehold.co/400x225/047857/ffffff?text=Alien"
    },
    {
      name: "Android",
      description: "You are some form of mechanical creation, be it a self-aware robot, an artificially-constructed human, or even a human brain in a cybernetic body.",
      abilityBonuses: [
        { ability: "Intelligence", bonus: 2 }
      ],
      uniqueAdvantage: "Artificial Mind: Being an artificial life form, you are not susceptible to emotions that drive carbon-based life forms. You gain a +5 bonus to saving throws against fear effects.",
      uniqueDisadvantage: "Lack of Emotion: You suffer a -5 penalty on all insight rolls to read another's emotional state.",
      image: "https://placehold.co/400x225/6366f1/ffffff?text=Android"
    },
    {
      name: "Cosmic",
      description: "You can tap into and channel the energies that permeate the universe. How you gained these powers is up to you, but you might possess an alien artifact that draws upon such energies.",
      abilityBonuses: [
        { ability: "Constitution", bonus: 1 },
        { ability: "Any", bonus: 1 }
      ],
      uniqueAdvantage: "Limitless Cosmic Power: The energies that permeate the universe are nigh inexhaustible. You receive the Increased Burnout Power Feat.",
      uniqueDisadvantage: "Power Limits: While you have access to unending cosmic energy, you don't have an unending suite of powers to call upon.",
      image: "https://placehold.co/400x225/7c3aed/ffffff?text=Cosmic"
    },
    {
      name: "Demigod",
      description: "You are a 'divine' being. It is possible you're the result of the union between a god and a mortal, or you may be the avatar of such a being, sent to Earth to work its will.",
      abilityBonuses: [
        { ability: "Any", bonus: 2 }
      ],
      uniqueAdvantage: "Divine Blood, Divine Power: As a demigod, you possess a mystical and physical connection to the essence of your divine lineage. You receive the Power Surge Power Feat.",
      uniqueDisadvantage: "Divine Limitations: Your divine heritage comes with certain restrictions or taboos that you must observe or risk losing access to your powers.",
      image: "https://placehold.co/400x225/be123c/ffffff?text=Demigod"
    },
    {
      name: "Highly Trained",
      description: "You are one of those exceptionally rare individuals who trained your body and mind to near perfection, allowing you to stand alongside Superheroes despite having no powers.",
      abilityBonuses: [
        { ability: "Any", bonus: 1 },
        { ability: "Any", bonus: 1 },
        { ability: "Any", bonus: 1 }
      ],
      uniqueAdvantage: "My knowledge is my power: You gain 10 additional points to buy skills or feats. Also, unlike other Heroes, you may purchase up to three skill sets.",
      uniqueDisadvantage: "Only Human: You are ultimately only human; you may never increase your physical attributes beyond 20. You do not possess any inborn powers.",
      image: "https://placehold.co/400x225/b45309/ffffff?text=Highly+Trained"
    },
    {
      name: "Mystic",
      description: "You are one of the rarest heroes, a mystic arts practitioner, or a mystic power wielder. You might be a magician calling ancient powers or an artifact may have chosen you.",
      abilityBonuses: [
        { ability: "Wisdom", bonus: 2 }
      ],
      uniqueAdvantage: "Spell-Casting: You use the spell-like power model and add your wisdom bonus to the burn threshold of all powers with the supernatural modifier.",
      uniqueDisadvantage: "Mystic Backlash: When you fail a burnout save by more than 5, your powers physically manifest and attack you.",
      image: "https://placehold.co/400x225/a21caf/ffffff?text=Mystic"
    },
    {
      name: "Super-Human",
      description: "You may have been born with your powers, seeing them develop over time, or be a result of scientific experimentation or a 'lucky accident' triggering the Ultra-Gene.",
      abilityBonuses: [
        { ability: "Constitution", bonus: 2 }
      ],
      uniqueAdvantage: "Super: After hero creation, raise the power scores of all your inborn powers by 1. These powers must be inborn, part of your physiology.",
      uniqueDisadvantage: "Power Limits: Super-Humans are born with specific Ultra genes, which dictate the powers they can develop. You can only gain new powers through mastering emulated powers.",
      image: "https://placehold.co/400x225/6d28d9/ffffff?text=Super-Human"
    },
    {
      name: "Tech Hero",
      description: "You are a genius at the top of your field. You might be a roboticist or a weapons designer; regardless, you have transformed your technical knowledge into a heroic career.",
      abilityBonuses: [
        { ability: "Intelligence", bonus: 2 }
      ],
      uniqueAdvantage: "Tech Genius: All external power sources have their burnout threshold increased by your Intelligence modifier.",
      uniqueDisadvantage: "Unreliable at the best of times: At any time, once per scene, a piece of your tech or an external power source may fail to work.",
      image: "https://placehold.co/400x225/0284c7/ffffff?text=Tech+Hero"
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
                  
                  <div className="space-y-4">
                    {/* Ability Score Bonus */}
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

                    {/* Unique Advantage */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-green-400">Unique Advantage:</h4>
                      <p className="text-gray-400 text-xs">{origin.uniqueAdvantage}</p>
                    </div>
                    
                    {/* Unique Disadvantage */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-red-400">Unique Disadvantage:</h4>
                      <p className="text-gray-400 text-xs">{origin.uniqueDisadvantage}</p>
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

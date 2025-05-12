import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCharacter } from "@/context/CharacterContext";

export default function Step2_Origin() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [origins, setOrigins] = useState<string[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<string>(character.origin || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch origin data from the JSON file
    fetch('/src/rules/origins.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load origins data');
        }
        return response.json();
      })
      .then(data => {
        setOrigins(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading origins:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const handleContinue = () => {
    if (selectedOrigin) {
      updateCharacterField('origin', selectedOrigin);
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  // Origin descriptions
  const originDescriptions: Record<string, string> = {
    "Super-Human": "Born with extraordinary abilities that manifest during adolescence or under stress.",
    "Tech Hero": "Relies on advanced technology and gadgets for superheroic abilities.",
    "Mystic": "Draws power from arcane sources, ancient rituals, or otherworldly entities.",
    "Highly Trained": "No inherent powers, but has achieved peak human condition through intense training.",
    "Alien": "Extraterrestrial being with physiological differences that grant special abilities.",
    "Demi-God": "Descendant of divine beings, bestowed with supernatural powers and abilities."
  };

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
          <RadioGroup 
            value={selectedOrigin}
            onValueChange={setSelectedOrigin}
            className="space-y-4"
          >
            {origins.map((origin) => (
              <div key={origin} className="flex items-start space-x-2">
                <RadioGroupItem 
                  value={origin} 
                  id={origin}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={origin} className="font-comic text-xl cursor-pointer">
                    {origin}
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">{originDescriptions[origin] || "Description not available."}</p>
                </div>
              </div>
            ))}
          </RadioGroup>

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

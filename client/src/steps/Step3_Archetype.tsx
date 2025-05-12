import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";

export default function Step3_Archetype() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>(character.archetype || "");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch archetype data from the JSON file
    fetch('/src/rules/archetypes.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load archetypes data');
        }
        return response.json();
      })
      .then(data => {
        setArchetypes(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading archetypes:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

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

  // Archetype descriptions
  const archetypeDescriptions: Record<string, string> = {
    "Bruiser": "Physically powerful character focused on strength and toughness. Excels at close combat and dealing/taking damage.",
    "Speedster": "Super-fast character with lightning reflexes. Masters of mobility, evasion, and striking multiple targets.",
    "Blaster": "Ranged damage specialist with destructive powers. Excellent at attacking from a distance with various energy types.",
    "Defender": "Protective character with abilities focused on shielding and supporting allies. Specialists in damage mitigation.",
    "Gadgeteer": "Tech-focused character with an arsenal of devices and tools. Adaptable problem-solvers with a tool for every situation.",
    "Mentalist": "Psychic character with powers of the mind. Masters of mental manipulation, telepathy, and psychokinesis.",
    "Mastermind": "Strategic genius with enhanced intelligence. Excel at planning, invention, and outsmarting opponents.",
    "Shapeshifter": "Adaptable character who can change form. Specializes in infiltration, disguise, and versatile combat forms."
  };

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
          <RadioGroup 
            value={selectedArchetype}
            onValueChange={setSelectedArchetype}
            className="space-y-4"
          >
            {archetypes.map((archetype) => (
              <div key={archetype} className="flex items-start space-x-2">
                <RadioGroupItem 
                  value={archetype} 
                  id={archetype}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={archetype} className="font-comic text-xl cursor-pointer">
                    {archetype}
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">{archetypeDescriptions[archetype] || "Description not available."}</p>
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
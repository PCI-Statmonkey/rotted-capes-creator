import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCharacter } from "@/context/CharacterContext";
import { trackEvent } from "@/lib/analytics";

// Example complications for users to choose from
const SAMPLE_COMPLICATIONS = [
  { name: "Enemies", description: "You have made powerful enemies who actively work against you." },
  { name: "Secret Identity", description: "You maintain a secret identity that must be protected." },
  { name: "Phobia", description: "You have an irrational fear of something that impedes your actions." },
  { name: "Responsibility", description: "You feel responsible for someone or something." },
  { name: "Reputation", description: "You have a reputation that affects how others treat you." },
  { name: "Obsession", description: "You're obsessed with something that can lead you to make poor decisions." },
  { name: "Vulnerability", description: "You have a specific vulnerability beyond the norm." },
  { name: "Relationship", description: "You have a relationship that complicates your life." },
  { name: "Honor Code", description: "You follow a strict honor code that limits your actions." },
  { name: "Compulsion", description: "You feel compelled to act a certain way in specific situations." },
];

export default function Step7_Complications() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();
  const [newComplication, setNewComplication] = useState({ name: "", description: "" });
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  // Handle going to previous step
  const handlePrevious = () => {
    setCurrentStep(6);
  };

  // Handle going to next step
  const handleContinue = () => {
    // Track the event in analytics
    trackEvent('complete_step', 'character_creation', 'complications');
    
    setCurrentStep(8);
  };

  // Add a complication to the character
  const addComplication = () => {
    if (newComplication.name.trim() && newComplication.description.trim()) {
      const updatedComplications = [
        ...character.complications,
        { ...newComplication }
      ];
      
      updateCharacterField('complications', updatedComplications);
      setNewComplication({ name: "", description: "" });
      setSelectedSample(null);
    }
  };

  // Remove a complication from the character
  const removeComplication = (index: number) => {
    const updatedComplications = [...character.complications];
    updatedComplications.splice(index, 1);
    updateCharacterField('complications', updatedComplications);
  };

  // Use a sample complication
  const useSampleComplication = (complication: { name: string, description: string }) => {
    setNewComplication(complication);
    setSelectedSample(complication.name);
  };

  // Check if we can proceed to the next step
  const canProceed = () => {
    // Require at least one complication
    return character.complications.length > 0;
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
        <h2 className="text-3xl font-bold text-white mb-6 font-comic">Character Complications</h2>
        
        <div className="text-gray-300 mb-6">
          <p>
            Complications add depth to your character and can create interesting story moments. 
            Each character should have at least one complication that represents a challenge 
            they must overcome or a weakness that can be exploited.
          </p>
        </div>
        
        {/* Current Complications */}
        <div className="mb-8">
          <h3 className="text-xl font-comic mb-3">Your Complications</h3>
          
          {character.complications.length === 0 ? (
            <div className="p-4 bg-gray-800 rounded-lg text-gray-400 italic">
              No complications added yet. Add at least one complication to proceed.
            </div>
          ) : (
            <div className="space-y-2">
              {character.complications.map((complication, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gray-800 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-accent">{complication.name}</h4>
                    <p className="text-sm text-gray-300 mt-1">{complication.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeComplication(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add New Complication */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-comic mb-3">Add a Complication</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Complication Name</label>
              <Input 
                value={newComplication.name}
                onChange={(e) => setNewComplication({...newComplication, name: e.target.value})}
                placeholder="e.g., Secret Identity, Phobia, Enemies"
                className="bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Description</label>
              <Textarea 
                value={newComplication.description}
                onChange={(e) => setNewComplication({...newComplication, description: e.target.value})}
                placeholder="Describe how this complication affects your character..."
                className="bg-gray-700"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={addComplication}
              disabled={!newComplication.name.trim() || !newComplication.description.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Complication
            </Button>
          </div>
        </div>
        
        {/* Sample Complications */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-comic mb-3">Sample Complications</h3>
          <p className="text-sm text-gray-400 mb-3">
            Click on any of these sample complications to use them as a starting point.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SAMPLE_COMPLICATIONS.map((complication) => (
              <div 
                key={complication.name}
                className={`p-2 rounded-md cursor-pointer transition-colors text-sm ${
                  selectedSample === complication.name 
                    ? 'bg-accent/20 border border-accent' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => useSampleComplication(complication)}
              >
                <h4 className="font-medium">{complication.name}</h4>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{complication.description}</p>
              </div>
            ))}
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
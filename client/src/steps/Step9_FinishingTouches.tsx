import React, { useState } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, AlertTriangle, Info, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Step9_FinishingTouches() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  const [customFlaw, setCustomFlaw] = useState("");
  const [customFlawDescription, setCustomFlawDescription] = useState("");
  
  // Personality flaws for superhero characters
  const personalityFlaws = [
    "Arrogant - Believes they are superior to others",
    "Reckless - Acts without thinking of consequences",
    "Vengeful - Unable to let go of past wrongs",
    "Distrustful - Has difficulty trusting others",
    "Stubborn - Refuses to change their mind or approach",
    "Impulsive - Acts on emotion rather than reason",
    "Overprotective - Tries to shield others to unhealthy degrees",
    "Indecisive - Unable to make quick decisions under pressure",
    "Obsessive - Fixates on goals to the exclusion of all else",
    "Insecure - Doubts their own abilities and worth",
    "Perfectionist - Cannot accept anything less than perfection",
    "Guilt-Ridden - Carries unbearable guilt for past actions",
    "Temperamental - Prone to emotional outbursts",
    "Paranoid - Sees threats and conspiracies everywhere",
    "Secretive - Keeps important information from allies"
  ];

  const handleSaveCharacter = () => {
    saveCharacter();
    toast({
      title: "Character Saved",
      description: `${character.name} has been saved successfully.`,
    });
  };
  
  const toggleFlaw = (flaw: string) => {
    const currentFlaws = character.personalityFlaws ? [...character.personalityFlaws] : [];
    if (currentFlaws.includes(flaw)) {
      // Remove the flaw if it's already selected
      updateCharacterField(
        'personalityFlaws', 
        currentFlaws.filter(f => f !== flaw)
      );
    } else {
      // Add the flaw if it's not already selected
      updateCharacterField('personalityFlaws', [...currentFlaws, flaw]);
    }
  };
  
  const addCustomFlaw = () => {
    if (customFlaw.trim() === "") return;
    
    const flawToAdd = customFlaw.trim();
    const currentFlaws = character.personalityFlaws || [];
    
    if (!currentFlaws.includes(flawToAdd)) {
      updateCharacterField('personalityFlaws', [...currentFlaws, flawToAdd]);
      setCustomFlaw(""); // Clear the input after adding
      
      toast({
        title: "Custom Flaw Added",
        description: `"${flawToAdd}" has been added to your character's flaws.`,
      });
    }
  };
  
  const removeFlaw = (flaw: string) => {
    const currentFlaws = character.personalityFlaws || [];
    updateCharacterField(
      'personalityFlaws', 
      currentFlaws.filter(f => f !== flaw)
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Finishing Touches</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Define Your Character's Core</CardTitle>
          <CardDescription>
            Add the final defining elements that make your character unique and memorable
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Personality Flaws Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Personality Flaws</h3>
              <p className="text-gray-400 mb-4">
                Every hero has flaws that humanize them and create internal conflict. 
                Choose one or more personality flaws for your character.
              </p>
            </div>
            
            {/* Selected Flaws Display */}
            {character.personalityFlaws && character.personalityFlaws.length > 0 && (
              <div className="mb-4">
                <Label>Selected Flaws</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.personalityFlaws.map((flaw, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                      {flaw}
                      <button 
                        onClick={() => removeFlaw(flaw)} 
                        className="ml-1 text-gray-400 hover:text-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Flaw Selection Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-800 p-4 rounded-lg">
              {personalityFlaws.map((flaw) => (
                <div key={flaw} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`flaw-${flaw}`} 
                    checked={character.personalityFlaws ? character.personalityFlaws.includes(flaw) : false}
                    onCheckedChange={() => toggleFlaw(flaw)}
                  />
                  <Label 
                    htmlFor={`flaw-${flaw}`}
                    className="text-sm cursor-pointer"
                  >
                    {flaw}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Custom Flaw Input */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="customFlaw">Add Custom Flaw</Label>
              <div className="flex gap-2">
                <Input 
                  id="customFlaw" 
                  value={customFlaw}
                  onChange={(e) => setCustomFlaw(e.target.value)}
                  placeholder="e.g., 'Overconfident - Too sure of their abilities'"
                  className="bg-gray-700 flex-grow"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addCustomFlaw}
                  disabled={customFlaw.trim() === ""}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Create a custom flaw if none of the predefined options suit your character
              </p>
            </div>
            
            {/* Flaw Manifestation */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="flawDescription">
                How Do These Flaws Manifest in Your Character?
              </Label>
              <Textarea 
                id="flawDescription" 
                value={customFlawDescription}
                onChange={(e) => setCustomFlawDescription(e.target.value)}
                placeholder="Explain how these flaws affect your character's actions, decisions, and relationships..."
                className="bg-gray-700 min-h-[100px]"
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Tagline Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Character Tagline</h3>
              <p className="text-gray-400 mb-4">
                Create a memorable catchphrase or motto that encapsulates your character's philosophy or attitude.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input 
                id="tagline" 
                value={character.tagline} 
                onChange={(e) => updateCharacterField('tagline', e.target.value)}
                placeholder="e.g., 'With great power comes great responsibility'"
                className="bg-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                A good tagline reflects your character's values and can be referenced during gameplay
              </p>
            </div>
            
            <div className="bg-blue-900/30 p-4 rounded-lg mt-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-blue-300 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-300">Tagline Tips</h4>
                  <p className="text-sm text-blue-100 mt-1">
                    Great taglines are short, memorable, and reflect your character's core beliefs.
                    Think about what motivates your character or what lesson they've learned from their experiences.
                  </p>
                  <p className="text-sm text-blue-100 mt-2">
                    Examples: "Never again will the innocent suffer if I can prevent it." or
                    "In a world of monsters, be the worst monster."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-8">
        <Button 
          onClick={handleSaveCharacter} 
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Character
        </Button>
      </div>
      
      <div className="bg-amber-900/30 p-4 rounded-lg mt-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-400">One Last Step</h4>
            <p className="text-sm text-amber-200 mt-1">
              After adding these final touches, proceed to the Summary page to review your complete character
              and generate your character sheet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
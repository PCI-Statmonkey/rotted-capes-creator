import React, { useState } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, AlertTriangle, Info } from "lucide-react";

export default function Step9_FinishingTouches() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  
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
          {/* Personality Flaw Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Personality Flaw</h3>
              <p className="text-gray-400 mb-4">
                Every hero has a flaw that humanizes them and creates internal conflict. Choose or create a personality flaw for your character.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalityFlaw">Select a Personality Flaw</Label>
                <Select 
                  value={character.personalityFlaw || ""} 
                  onValueChange={(value) => updateCharacterField('personalityFlaw', value)}
                >
                  <SelectTrigger className="bg-gray-700">
                    <SelectValue placeholder="Choose a personality flaw" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityFlaws.map((flaw) => (
                      <SelectItem key={flaw} value={flaw}>
                        {flaw}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Flaw (describe below)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show text area for custom flaw or elaboration */}
              <div className="space-y-2">
                <Label htmlFor="customFlaw">
                  {character.personalityFlaw === 'custom' 
                    ? 'Describe Your Custom Flaw' 
                    : 'How Does This Flaw Manifest in Your Character?'}
                </Label>
                <Textarea 
                  id="customFlaw" 
                  placeholder={character.personalityFlaw === 'custom' 
                    ? "Describe your character's unique personality flaw..." 
                    : "Explain how this flaw affects your character's actions and relationships..."}
                  className="bg-gray-700 min-h-[100px]"
                />
              </div>
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
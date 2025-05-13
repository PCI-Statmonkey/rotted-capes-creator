import React, { useState, useEffect, useRef } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { calculateModifier, formatModifier } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Save, AlertTriangle, FileText, Info, Medal, ArrowRight, Trash2 } from "lucide-react";

export default function Step10_Summary() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  const [activeTab, setActiveTab] = useState("derived-stats");
  const summaryRef = useRef<HTMLDivElement>(null);

  // Calculate derived stats
  const calculateDerivedStats = () => {
    const dexMod = calculateModifier(character.abilities.dexterity.value);
    const conMod = calculateModifier(character.abilities.constitution.value);
    const intMod = calculateModifier(character.abilities.intelligence.value);
    const wisMod = calculateModifier(character.abilities.wisdom.value);
    
    // Defense calculation
    let defense = 10 + dexMod;
    
    // Toughness calculation 
    let toughness = conMod;
    
    // Fortitude, Reflex, Willpower calculations
    let fortitude = conMod;
    let reflex = dexMod;
    let willpower = wisMod;
    
    // Initiative calculation
    let initiative = dexMod;
    
    return {
      defense,
      toughness,
      fortitude,
      reflex,
      willpower,
      initiative
    };
  };

  // Update derived stats whenever relevant character fields change
  useEffect(() => {
    const derivedStats = calculateDerivedStats();
    
    updateCharacterField('defense', derivedStats.defense);
    updateCharacterField('toughness', derivedStats.toughness);
    updateCharacterField('fortitude', derivedStats.fortitude);
    updateCharacterField('reflex', derivedStats.reflex);
    updateCharacterField('willpower', derivedStats.willpower);
    updateCharacterField('initiative', derivedStats.initiative);
  }, [character.abilities, updateCharacterField]);

  const handleSaveCharacter = () => {
    saveCharacter();
    toast({
      title: "Character Saved",
      description: `${character.name} has been saved successfully.`,
    });
  };

  // Character point calculations
  const calculatePointsSpent = () => {
    // Abilities points (cost per point varies)
    let abilitiesPoints = 0;
    for (const ability in character.abilities) {
      const abilityValue = character.abilities[ability as keyof typeof character.abilities].value;
      // Points cost calculation: 10 is free, each point above costs 1 point
      abilitiesPoints += Math.max(0, abilityValue - 10);
    }

    // Skills points (1 point per rank)
    const skillsPoints = character.skills.reduce((total, skill) => {
      return total + (skill.ranks || 0);
    }, 0);

    // Powers points (varies by power)
    const powersPoints = character.powers.reduce((total, power) => {
      // Base cost for a power
      let powerCost = power.cost || 0;
      
      // Add perks costs (usually 1 point each)
      if (power.perks) {
        powerCost += power.perks.length;
      }
      
      // Subtract flaw benefits (usually 1 point each)
      if (power.flaws) {
        powerCost -= power.flaws.length;
      }
      
      return total + powerCost;
    }, 0);

    // Total points
    const totalPoints = abilitiesPoints + skillsPoints + powersPoints;

    return {
      abilities: abilitiesPoints,
      skills: skillsPoints,
      powers: powersPoints,
      total: totalPoints
    };
  };

  useEffect(() => {
    const pointsSpent = calculatePointsSpent();
    updateCharacterField('pointsSpent', pointsSpent);
  }, [character.abilities, character.skills, character.powers, updateCharacterField]);

  return (
    <div className="container mx-auto px-4 py-6" ref={summaryRef}>
      <h1 className="text-3xl font-bold mb-6">Character Summary</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{character.name || "Character Summary"}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSaveCharacter}>
                <Save className="mr-2 h-4 w-4" />
                Save Character
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  if (summaryRef.current) {
                    toast({
                      title: "Generating PDF",
                      description: "Your character sheet is being generated.",
                    });
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Final review of your character stats and details
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="derived-stats">Derived Stats</TabsTrigger>
              <TabsTrigger value="points-summary">Points Summary</TabsTrigger>
              <TabsTrigger value="character-details">Character Details</TabsTrigger>
            </TabsList>
            
            {/* Derived Stats Tab */}
            <TabsContent value="derived-stats" className="space-y-4">
              <h3 className="text-lg font-semibold">Derived Character Statistics</h3>
              <p className="text-gray-400 mb-4">
                These values are calculated automatically based on your character's abilities, skills, and powers.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Defense</CardTitle>
                    <CardDescription>Ability to avoid attacks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{character.defense}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Toughness</CardTitle>
                    <CardDescription>Resistance to damage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{character.toughness}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Initiative</CardTitle>
                    <CardDescription>Combat turn order bonus</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{formatModifier(character.initiative)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Fortitude</CardTitle>
                    <CardDescription>Physical resilience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{character.fortitude}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Reflex</CardTitle>
                    <CardDescription>Reaction speed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{character.reflex}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Willpower</CardTitle>
                    <CardDescription>Mental fortitude</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{character.willpower}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Points Summary Tab */}
            <TabsContent value="points-summary">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Character Points Summary</h3>
                <p className="text-gray-400 mb-4">
                  A breakdown of how you've spent your character points.
                </p>
                
                <div className="grid gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Abilities</span>
                      <span>{character.pointsSpent.abilities} points</span>
                    </div>
                    <Progress value={(character.pointsSpent.abilities / character.pointsSpent.total) * 100} />
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Skills</span>
                      <span>{character.pointsSpent.skills} points</span>
                    </div>
                    <Progress value={(character.pointsSpent.skills / character.pointsSpent.total) * 100} />
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Powers</span>
                      <span>{character.pointsSpent.powers} points</span>
                    </div>
                    <Progress value={(character.pointsSpent.powers / character.pointsSpent.total) * 100} />
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Points Spent</span>
                      <span>{character.pointsSpent.total} points</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-4 rounded-lg mt-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-300 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300">Points Allocation Note</h4>
                      <p className="text-sm text-blue-100 mt-1">
                        Standard character creation in Rotted Capes uses 100 points: 36 for Abilities, 20 for Skills, 
                        32 for Powers, and 12 for Weaknesses that can be allocated to any category.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Character Details Tab */}
            <TabsContent value="character-details" className="space-y-6">
              <h3 className="text-lg font-semibold">Character Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-3">Identity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hero Name:</span>
                      <span className="font-medium">{character.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Secret Identity:</span>
                      <span className="font-medium">{character.secretIdentity || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Concept:</span>
                      <span className="font-medium">{character.concept || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Origin:</span>
                      <span className="font-medium">{character.origin || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Archetype:</span>
                      <span className="font-medium">{character.archetype || "—"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-3">Physical Traits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span className="font-medium">{character.gender || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <span className="font-medium">{character.age || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Height:</span>
                      <span className="font-medium">{character.height || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weight:</span>
                      <span className="font-medium">{character.weight || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-base font-medium mb-3">Character Essence</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 block mb-1">Personality Flaws:</span>
                    {character.personalityFlaws && character.personalityFlaws.length > 0 ? (
                      <div className="font-medium">
                        {character.personalityFlaws.map((flaw, index) => (
                          <div key={index} className="mb-1">• {flaw}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="block">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Tagline:</span>
                    <span className="font-medium block italic">"{character.tagline || "—"}"</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Appearance:</span>
                    <span className="block">{character.appearance || "—"}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-3">Powers Summary</h4>
                  <div className="space-y-2">
                    {character.powers.length > 0 ? character.powers.map((power, index) => (
                      <div key={index} className="py-1 border-b border-gray-700 last:border-0">
                        <div className="font-medium">{power.name}</div>
                        <div className="text-sm text-gray-400">{power.description}</div>
                      </div>
                    )) : (
                      <div className="text-gray-400">No powers selected</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-base font-medium mb-3">Equipment Summary</h4>
                  <div className="space-y-2">
                    {character.gear.length > 0 ? character.gear.map((item, index) => (
                      <div key={index} className="py-1 border-b border-gray-700 last:border-0">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-400">{item.description}</div>
                      </div>
                    )) : (
                      <div className="text-gray-400">No gear selected</div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Character Completion Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.name ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.name ? "" : "text-gray-500"}>Character name provided</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.concept ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.concept ? "" : "text-gray-500"}>Character concept defined</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.origin ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.origin ? "" : "text-gray-500"}>Origin selected</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.archetype ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.archetype ? "" : "text-gray-500"}>Archetype chosen</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.personalityFlaws.length > 0 ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.personalityFlaws.length > 0 ? "" : "text-gray-500"}>Personality flaws defined</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.tagline ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.tagline ? "" : "text-gray-500"}>Character tagline created</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.skills.length > 0 ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.skills.length > 0 ? "" : "text-gray-500"}>Skills selected</span>
            </div>
            
            <div className="flex items-center">
              <Check className={`h-5 w-5 mr-2 ${character.powers.length > 0 ? "text-green-400" : "text-gray-500"}`} />
              <span className={character.powers.length > 0 ? "" : "text-gray-500"}>Powers defined</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button onClick={handleSaveCharacter} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Save Character
        </Button>
        
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={() => {
            if (summaryRef.current) {
              toast({
                title: "Generating PDF",
                description: "Your character sheet is being generated.",
              });
            }
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Character Sheet
        </Button>
      </div>
      
      <div className="bg-amber-900/30 p-4 rounded-lg mt-8">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-400">Character Approval Required</h4>
            <p className="text-sm text-amber-200 mt-1">
              Remember that all new characters need approval from your Editor-in-Chief (Game Master) 
              before they can be used in play. Make sure to review all your character details 
              before submitting them for approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
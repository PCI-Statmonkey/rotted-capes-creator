import React, { useState, useEffect, useRef } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { calculateModifier, formatModifier } from "@/lib/utils";
import { Check, Save, Shield, Heart, Target } from "lucide-react";
import CharacterPdfButton from "@/components/CharacterPdfButton";

export default function Step10_Summary() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  const summaryRef = useRef<HTMLDivElement>(null);

  // Calculate derived stats
  const calculateDerivedStats = () => {
    const strMod = calculateModifier(character.abilities.strength.value);
    const dexMod = calculateModifier(character.abilities.dexterity.value);
    const conMod = calculateModifier(character.abilities.constitution.value);
    const intMod = calculateModifier(character.abilities.intelligence.value);
    const wisMod = calculateModifier(character.abilities.wisdom.value);
    const chaMod = calculateModifier(character.abilities.charisma.value);
    
    // Defense calculation - in Rotted Capes 2.0 this is called "Avoidance"
    let avoidance = 10 + dexMod;
    
    // Fortitude calculation
    let fortitude = 10 + (strMod > conMod ? strMod : conMod);
    
    // Willpower calculation
    let willpower = 10 + (wisMod > chaMod ? wisMod : chaMod);
    
    // Stamina calculation
    let stamina = avoidance + fortitude + willpower;
    
    // Wounds calculation
    let wounds = Math.max(3, Math.floor(conMod / 2));
    
    // Initiative calculation
    let initiative = dexMod;
    
    // Running pace
    let runningPace = 30 + (strMod * 5);
    
    return {
      avoidance,
      fortitude,
      willpower,
      stamina,
      wounds,
      initiative,
      runningPace
    };
  };

  // Derived stats are calculated on the fly
  const derivedStats = calculateDerivedStats();
  
  // Update character defense to match avoidance for compatibility
  useEffect(() => {
    updateCharacterField('defense', derivedStats.avoidance);
    updateCharacterField('fortitude', derivedStats.fortitude);
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
  const handleFinishCharacter = async () => {
  try {
    const mockUserEmail = localStorage.getItem("mockUserEmail");
    const userId = 1; // TEMP: Replace with actual user lookup if needed

    const payload = {
      userId,
      name: character.name,
      data: {
        ...character,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    const response = await fetch("/api/characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Failed to save character");
    }

    const result = await response.json();
    toast({
      title: "Character Finalized",
      description: `Your character has been saved as ID #${result.characterId}.`,
    });

    window.location.assign("/profile"); // or wherever you want to go next
  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "There was a problem saving your character.",
    });
  }
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
      
      // Add cost for perks
      if (power.perks) {
        powerCost += power.perks.length;
      }
      
      // Subtract points for flaws
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

  // Update points spent
  useEffect(() => {
    const pointsSpent = calculatePointsSpent();
    updateCharacterField('pointsSpent', pointsSpent);
  }, [character.abilities, character.skills, character.powers, updateCharacterField]);

  return (
    <div className="container mx-auto px-4 py-6" ref={summaryRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Character Sheet</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveCharacter} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Character
          </Button>
          
          <CharacterPdfButton 
            character={character}
            elementRef={summaryRef}
            label="Download Sheet"
            variant="default"
          />
        </div>
      </div>
      
      {/* Character Sheet Header */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Name and Flaws */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-400">Name</Label>
                <h2 className="text-2xl font-bold">{character.name || "Unnamed Hero"}</h2>
                <p className="text-gray-400 text-sm">{character.secretIdentity ? `Secret Identity: ${character.secretIdentity}` : ""}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Flaws</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {character.personalityFlaws && character.personalityFlaws.length > 0 ? 
                    character.personalityFlaws.map((flaw, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600">
                        {flaw}
                      </Badge>
                    )) : 
                    <span className="text-gray-500 text-sm">No flaws specified</span>
                  }
                </div>
              </div>
            </div>
            
            {/* Middle column - Origin/Archetype */}
            <div className="md:text-center space-y-4">
              <div>
                <Label className="text-sm text-gray-400">Origin/Archetype</Label>
                <p className="font-semibold">{character.origin || "No Origin"} / {character.archetype || "No Archetype"}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Concept</Label>
                <p className="font-semibold">{character.concept || "No Concept"}</p>
              </div>
            </div>
            
            {/* Right column - Tagline and Pace */}
            <div className="space-y-4 md:text-right">
              <div>
                <Label className="text-sm text-gray-400">Tagline</Label>
                <p className="font-semibold italic">"{character.tagline || "No tagline"}"</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-400">Running Pace</Label>
                <p className="font-semibold">{derivedStats.runningPace} feet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Abilities & Defenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Abilities Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center">Abilities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left py-2">Ability</th>
                  <th className="text-center py-2">Score</th>
                  <th className="text-center py-2">Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Strength</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.strength.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.strength.modifier)}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Dexterity</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.dexterity.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.dexterity.modifier)}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Constitution</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.constitution.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.constitution.modifier)}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Intelligence</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.intelligence.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.intelligence.modifier)}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Wisdom</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.wisdom.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.wisdom.modifier)}</td>
                </tr>
                <tr>
                  <td className="py-2">Charisma</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.charisma.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.charisma.modifier)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        
        {/* Defenses Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center">Defenses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Avoidance</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  {derivedStats.avoidance}
                </div>
                <p className="text-xs text-gray-400 mt-1">DEX or INT Bonus + 10</p>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Fortitude</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  {derivedStats.fortitude}
                </div>
                <p className="text-xs text-gray-400 mt-1">STR or CON Bonus + 10</p>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Willpower</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  {derivedStats.willpower}
                </div>
                <p className="text-xs text-gray-400 mt-1">WIS or CHA Bonus + 10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Health Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center">Health & Initiative</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Stamina</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-green-400" />
                  {derivedStats.stamina}
                </div>
                <p className="text-xs text-gray-400 mt-1">AVOID + FORT + WILL</p>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Wounds</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  {derivedStats.wounds}
                </div>
                <p className="text-xs text-gray-400 mt-1">Half CON Bonus (min 3)</p>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg">
                <Label className="text-xs text-gray-400 uppercase">Initiative</Label>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  {formatModifier(derivedStats.initiative)}
                </div>
                <p className="text-xs text-gray-400 mt-1">DEX Bonus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Powers, Skills, Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Powers Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center">
              <span className="flex-1">Powers</span>
              <Badge variant="outline" className="ml-2">{character.powers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {character.powers.length > 0 ? (
              <div className="space-y-4">
                {character.powers.map((power, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{power.name}</h3>
                      {power.score && (
                        <Badge variant="secondary">{power.score}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{power.description}</p>
                    
                    {(power.perks.length > 0 || power.flaws.length > 0) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {power.perks.length > 0 && (
                          <div>
                            <Label className="text-xs text-gray-400">Perks</Label>
                            <ul className="text-xs ml-4 list-disc">
                              {power.perks.map((perk, idx) => (
                                <li key={idx}>{perk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {power.flaws.length > 0 && (
                          <div>
                            <Label className="text-xs text-gray-400">Flaws</Label>
                            <ul className="text-xs ml-4 list-disc">
                              {power.flaws.map((flaw, idx) => (
                                <li key={idx}>{flaw}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No powers defined</div>
            )}
          </CardContent>
        </Card>
        
        {/* Skills and Gear */}
        <div className="space-y-6">
          {/* Skills Section */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center">
                <span className="flex-1">Skills</span>
                <Badge variant="outline" className="ml-2">{character.skills.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {character.skills.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 border-b border-gray-700">
                      <th className="text-left p-2">Skill</th>
                      <th className="text-center p-2">Ability</th>
                      <th className="text-center p-2">Ranks</th>
                      <th className="text-center p-2">Trained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {character.skills.map((skill, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-2">
                          {skill.name}
                          {skill.specialization && (
                            <span className="text-xs text-gray-400"> ({skill.specialization})</span>
                          )}
                        </td>
                        <td className="text-center p-2">{skill.ability.substring(0, 3).toUpperCase()}</td>
                        <td className="text-center p-2">{skill.ranks}</td>
                        <td className="text-center p-2">
                          {skill.trained ? (
                            <Check className="h-4 w-4 text-green-400 mx-auto" />
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-6 text-gray-500">No skills defined</div>
              )}
            </CardContent>
          </Card>
          
          {/* Gear Section */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center">
                <span className="flex-1">Gear</span>
                <Badge variant="outline" className="ml-2">{character.gear.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {character.gear.length > 0 ? (
                <div className="space-y-2">
                  {character.gear.map((item, index) => (
                    <div key={index} className="border-b border-gray-700 pb-2 last:border-0">
                      <div className="font-semibold">{item.name}</div>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">No gear acquired</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Complications and Feats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complications Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center">
              <span className="flex-1">Complications</span>
              <Badge variant="outline" className="ml-2">{character.complications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {character.complications.length > 0 ? (
              <div className="space-y-3">
                {character.complications.map((complication, index) => (
                  <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{complication.name}</h3>
                      {complication.type && (
                        <Badge variant="outline">{complication.type}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{complication.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No complications defined</div>
            )}
          </CardContent>
        </Card>
        
        {/* Feats Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center">
              <span className="flex-1">Feats</span>
              <Badge variant="outline" className="ml-2">{character.feats.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {character.feats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {character.feats.map((feat, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-2">
                    <div className="font-semibold">{feat.name}</div>
                    {feat.source && (
                      <div className="text-xs text-gray-400">Source: {feat.source}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No feats selected</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Character Completion Checklist */}
      <Card className="mb-6">
        <CardHeader className="py-3">
          <CardTitle>Character Completion Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.name ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.name ? "" : "text-gray-500"}>Character name created</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.secretIdentity ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.secretIdentity ? "" : "text-gray-500"}>Secret identity defined</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.concept ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.concept ? "" : "text-gray-500"}>Character concept written</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.appearance ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.appearance ? "" : "text-gray-500"}>Appearance described</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.origin ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.origin ? "" : "text-gray-500"}>Origin selected</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.archetype ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.archetype ? "" : "text-gray-500"}>Archetype selected</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.personalityFlaws && character.personalityFlaws.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.personalityFlaws && character.personalityFlaws.length > 0 ? "" : "text-gray-500"}>Personality flaws defined</span>
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
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.complications.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.complications.length > 0 ? "" : "text-gray-500"}>Complications selected</span>
              </div>
              
              <div className="flex items-center">
                <Check className={`h-5 w-5 mr-2 ${character.gear.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={character.gear.length > 0 ? "" : "text-gray-500"}>Gear acquired</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button 
          onClick={() => {
            saveCharacter();
            toast({
              title: "Character Saved",
              description: `${character.name || "Your character"} has been saved successfully.`,
            });
          }} 
          variant="outline"
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Character
        </Button>
        
        <div className="flex space-x-4">
          <CharacterPdfButton
            character={character}
            elementRef={summaryRef}
            label="Download PDF"
            variant="secondary"
          />
          
          <Button 
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useMemo } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getScoreData, formatModifier, displayFeatName } from "@/lib/utils";
import { Check, Save, Shield, Heart, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import CharacterPdfButton from "@/components/CharacterPdfButton";
import { parsePrerequisite, getMissingPrereqs, formatPrerequisite } from "@/utils/requirementValidator";
import useCachedGameContent from "@/hooks/useCachedGameContent";

export default function Step10_Summary() {
  const { character, updateCharacterField, saveCharacter } = useCharacter();
  const { selectedSkillSets, archetypeFeat } = useCharacterBuilder();
  const summaryRef = useRef<HTMLDivElement>(null);

  // Gear data used to identify weapons
  const { data: gearData = [] } = useCachedGameContent<any>("gear");

  // Merge feats with any archetype bonus feat
  const feats = useMemo(() => {
    const list = [...character.feats];
    if (typeof archetypeFeat === "string" && !list.some(f => f.name === archetypeFeat)) {
      list.push({ name: archetypeFeat, source: "Archetype" });
    }
    return list;
  }, [character.feats, archetypeFeat]);

  // Determine weapons from gear list
  const weaponNames = useMemo(() => {
    const categories = ["firearms", "archaicWeapons", "meleeWeapons", "otherWeapons"];
    return new Set(
      (gearData as any[])
        .filter(g => categories.includes(g.category))
        .map(g => g.name)
    );
  }, [gearData]);

  const weapons = useMemo(
    () => character.gear.filter(g => weaponNames.has(g.description || g.name)),
    [character.gear, weaponNames]
  );

  // Attack powers are powers with an attack or damage type
  const attackPowers = useMemo(
    () => character.powers.filter(p => (p as any).attack || p.damageType),
    [character.powers]
  );

  const getFinalPowerScore = (power: any) => {
    const flaws = power.flaws?.map((f: string) => f.toLowerCase()) || [];
    const isInborn = !flaws.some((f: string) =>
      f.includes("external power source") ||
      f.includes("all-skill") ||
      f.includes("removable")
    );
    const baseScore = power.finalScore ?? power.score ?? 0;
    return isInborn ? baseScore + 1 : baseScore;
  };

  // Calculate derived stats
  const calculateDerivedStats = () => {
    const strMod = getScoreData(character.abilities.strength.value).modifier;
    const dexMod = getScoreData(character.abilities.dexterity.value).modifier;
    const conMod = getScoreData(character.abilities.constitution.value).modifier;
    const intMod = getScoreData(character.abilities.intelligence.value).modifier;
    const wisMod = getScoreData(character.abilities.wisdom.value).modifier;
    const chaMod = getScoreData(character.abilities.charisma.value).modifier;
    
    // Avoidance uses the better of Dexterity or Intelligence plus rank bonus
    const avoidance = 10 + Math.max(dexMod, intMod) + character.rankBonus;

    // Fortitude uses the better of Strength or Constitution plus rank bonus
    const fortitude = 10 + Math.max(strMod, conMod) + character.rankBonus;

    // Willpower uses the better of Charisma or Wisdom plus rank bonus
    const willpower = 10 + Math.max(chaMod, wisMod) + character.rankBonus;
    
    // Stamina calculation
    const stamina = avoidance + fortitude + willpower;
    
    // Wounds calculation
    const wounds = Math.max(3, Math.ceil(conMod / 2));
    
    // Initiative calculation
    const initiative = dexMod;
    
    // Running pace is based on Dexterity modifier (min 1, max 5)
    // Quick feat grants an additional +1 to pace
    const hasQuick = feats.some((f) => f.name === "Quick");
    const runningPace = Math.min(Math.max(1 + dexMod, 1), 5) + (hasQuick ? 1 : 0);
    
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

  const prereqCharacterData = {
    abilityScores: Object.fromEntries(
      Object.entries(character.abilities).map(([k, v]) => [k, (v as any).value])
    ),
    selectedSkills: [],
    startingSkills: [] as any[],
    selectedFeats: feats,
    selectedSkillSets,
    skillSets: [] as any[],
  };
  
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

    const { powers, skills, gear, complications, ...base } = character;
    const powersWithBonus = powers.map(p => ({
      ...p,
      finalScore: getFinalPowerScore(p),
    }));

    const payload = {
      userId,
      name: character.name,
      data: {
        ...base,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      feats,
      powers: powersWithBonus,
      skills,
      gear,
      complications,
    };

    const response = await apiRequest('POST', '/api/characters', payload);

    if (!response.ok) {
      throw new Error("Failed to save character");
    }

    const result = await response.json();
    toast({
      title: "Character Finalized",
      description: `Your character has been saved as ID #${result.id}.`,
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

    // Skill points are no longer used; skill sets do not cost points here
    const skillsPoints = 0;

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
  }, [character.abilities, character.powers, updateCharacterField]);

  return (
    <div className="container mx-auto px-4 py-6 font-comic" ref={summaryRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-500">Step 10: Character Sheet</h1>
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
                <p className="font-semibold">{derivedStats.runningPace} areas</p>
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
            <CardTitle className="text-center text-xl font-medium">Abilities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left py-2">Ability</th>
                  <th className="text-center py-2">Score</th>
                  <th className="text-center py-2">Bonus</th>
                  <th className="text-center py-2">Die</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Strength</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.strength.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.strength.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.strength.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Dexterity</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.dexterity.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.dexterity.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.dexterity.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Constitution</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.constitution.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.constitution.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.constitution.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Intelligence</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.intelligence.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.intelligence.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.intelligence.baseDie || '-'}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2">Wisdom</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.wisdom.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.wisdom.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.wisdom.baseDie || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2">Charisma</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.charisma.value}</td>
                  <td className="text-center py-2 font-semibold">{formatModifier(character.abilities.charisma.modifier)}</td>
                  <td className="text-center py-2 font-semibold">{character.abilities.charisma.baseDie || '-'}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">Max Lift: {character.abilities.strength.maxLift} (Push/Drag {character.abilities.strength.maxPushDrag})</p>
          </CardContent>
        </Card>
        
        {/* Defenses Column */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-center text-xl font-medium">Defenses</CardTitle>
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
            <CardTitle className="text-center text-xl font-medium">Health & Initiative</CardTitle>
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
      
      {/* Powers, Skill Sets, Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Powers Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Powers</span>
              <Badge variant="outline" className="ml-2">{character.powers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {character.powers.length > 0 ? (
              <div className="space-y-4">
                {character.powers.map((power, index) => {
                  const score = getFinalPowerScore(power);
                  const data = getScoreData(score);
                  return (
                    <div key={index} className="border border-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{power.name}</h3>
                        {score > 0 && (
                          <Badge variant="secondary">{score}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Bonus: {formatModifier(data.modifier)}
                      </div>

                      {power.linkedPowers && power.linkedPowers.length > 0 && (
                        <div className="text-xs text-gray-300 mt-1">
                          <Label className="text-xs text-gray-400">Linked To:</Label>{" "}
                          {power.linkedPowers.join(", ")}
                        </div>
                      )}

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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No powers defined</div>
            )}
          </CardContent>
        </Card>
        
        {/* Attacks Section */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Attacks</span>
              <Badge variant="outline" className="ml-2">{weapons.length + attackPowers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {weapons.length > 0 && (
              <div>
                <Label className="text-xs text-gray-400">Weapons</Label>
                <ul className="list-disc list-inside text-sm">
                  {weapons.map((w, idx) => (
                    <li key={idx}>{w.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {attackPowers.length > 0 && (
              <div className={weapons.length > 0 ? "mt-4" : ""}>
                <Label className="text-xs text-gray-400">Powers</Label>
                <ul className="list-disc list-inside text-sm">
                  {attackPowers.map((p, idx) => (
                    <li key={idx}>
                      {p.name}
                      {(p as any).attack && (
                        <span className="text-xs text-gray-400"> ({(p as any).attack})</span>
                      )}
                      {!(p as any).attack && p.damageType && (
                        <span className="text-xs text-gray-400"> ({p.damageType})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {weapons.length === 0 && attackPowers.length === 0 && (
              <div className="text-center py-6 text-gray-500">No attacks defined</div>
            )}
          </CardContent>
        </Card>

        {/* Skill Sets and Gear */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center text-xl font-medium">
                <span className="flex-1">Skill Sets</span>
                <Badge variant="outline" className="ml-2">{selectedSkillSets.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {selectedSkillSets.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {selectedSkillSets.map((s, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{s.name}</span>
                      {s.edges && s.edges.length > 0 && (
                        <span>: {s.edges.join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 text-gray-500">No skill sets selected</div>
              )}
            </CardContent>
          </Card>

          {/* Gear Section */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center text-xl font-medium">
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
            <CardTitle className="flex items-center text-xl font-medium">
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
            <CardTitle className="flex items-center text-xl font-medium">
              <span className="flex-1">Feats</span>
              <Badge variant="outline" className="ml-2">{feats.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {feats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {feats.map((feat, index) => {
                  const prereqList = Array.isArray((feat as any).prerequisites)
                    ? (feat as any).prerequisites
                    : (feat as any).prerequisites
                    ? [(feat as any).prerequisites]
                    : [];
                  const parsed = prereqList.flatMap((p: any) =>
                    typeof p === "string" ? parsePrerequisite(p) : [p]
                  );
                  const formatReq = (req: any) => formatPrerequisite(req);
                  const missingObj = getMissingPrereqs(
                    feat,
                    prereqCharacterData
                  );
                  const missing = [...missingObj.hard, ...missingObj.soft].map(
                    formatReq
                  );
                  return (
                    <div key={index} className="border border-gray-700 rounded-lg p-2">
                      <div className="font-semibold">{displayFeatName(feat.name)}</div>
                      {feat.source && (
                        <div className="text-xs text-gray-400">Source: {feat.source}</div>
                      )}
                      {parsed.length > 0 && (
                        <div className="text-xs mt-1">
                          <span className="font-semibold text-white">Prerequisites:</span>
                          <ul className="list-disc pl-5 mt-1">
                            {parsed.map((req: any, idx: number) => {
                              const text = formatReq(req);
                              const unmet = missing.includes(text);
                              return (
                                <li key={idx} className={unmet ? "text-red-500" : "text-white"}>
                                  {text}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          <CardTitle className="text-xl font-medium">Character Completion Checklist</CardTitle>
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
                <Check className={`h-5 w-5 mr-2 ${selectedSkillSets.length > 0 ? "text-green-400" : "text-gray-500"}`} />
                <span className={selectedSkillSets.length > 0 ? "" : "text-gray-500"}>Skill sets selected</span>
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
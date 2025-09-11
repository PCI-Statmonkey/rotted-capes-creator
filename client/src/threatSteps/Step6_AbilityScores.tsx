import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useThreat } from "@/context/ThreatContext";
import { getAbilityScoreGuidance } from "@/data/abilityScoreGuidance";
import { getThreatParameter } from "@/data/threatParameters";
import { useState, useEffect } from "react";

const ABILITY_NAMES = {
  strength: "Strength",
  dexterity: "Dexterity", 
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma"
};

export default function Step6_AbilityScores() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const [abilityScores, setAbilityScores] = useState(threat.abilityScores);
  
  const guidance = getAbilityScoreGuidance(threat.rank);
  const params = getThreatParameter(threat.rank);

  useEffect(() => {
    setAbilityScores(threat.abilityScores);
  }, [threat.abilityScores]);

  const handleNext = () => {
    updateThreatField("abilityScores", abilityScores);
    
    // For threats, ability scores do NOT affect defenses (unlike heroes)
    // Defenses come from threat parameters only
    if (params) {
      updateThreatField("defenses", { 
        avoidance: params.defenses[0], 
        fortitude: params.defenses[1], 
        willpower: params.defenses[2] 
      });
    }
    
    // Calculate initiative (affected by Dexterity)
    const initiative = Math.floor((abilityScores.dexterity - 10) / 2) + (params?.rankBonus || 1);
    updateThreatField("initiative", initiative);
    
    // Calculate pace (affected by Dexterity - threats move faster with higher Dex)
    const basePace = 2; // Default 2 areas
    const pace = basePace + Math.max(0, Math.floor((abilityScores.dexterity - 10) / 4)); // +1 pace per 4 points of Dex above 10
    updateThreatField("pace", `${pace} areas`);
    
    setCurrentStep(8); // Go to Step 8 (Actions)
  };

  const handleBack = () => {
    setCurrentStep(6); // Go back to Step 6 (SkillSets)
  };

  const updateAbilityScore = (ability: keyof typeof abilityScores, value: number) => {
    setAbilityScores(prev => ({
      ...prev,
      [ability]: Math.max(3, Math.min(50, value))
    }));
  };

  const incrementAbility = (ability: keyof typeof abilityScores) => {
    const currentValue = abilityScores[ability];
    updateAbilityScore(ability, currentValue + 1);
  };

  const decrementAbility = (ability: keyof typeof abilityScores) => {
    const currentValue = abilityScores[ability];
    updateAbilityScore(ability, currentValue - 1);
  };

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const isAbilityScoreValid = (ability: keyof typeof abilityScores, score: number) => {
    if (!guidance) return true;
    return score <= guidance.rankCap;
  };

  const getAbilityScoreColor = (ability: keyof typeof abilityScores, score: number) => {
    if (!isAbilityScoreValid(ability, score)) return "text-destructive";
    return "text-foreground";
  };

  return (
    <div className="space-y-6" data-testid="step-ability-scores">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              7
            </span>
            Ability Scores
          </CardTitle>
          <CardDescription>
            Set ability scores that fit the threat's concept, rank, and narrative role. Stay within the rank cap limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Rank Cap Warning */}
          {guidance && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">Rank {threat.rank} Guidelines</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Rank Cap: {guidance.rankCap}</span> - No ability score may exceed this value.
              </p>
              <p className="text-sm text-muted-foreground">
                You can start with ability scores that feel right for the concept, then calculate saves and defenses from them, 
                or start with the defenses you want and backfill the ability scores to match.
              </p>
            </div>
          )}

          {/* Ability Score Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ABILITY_NAMES).map(([key, name]) => {
              const ability = key as keyof typeof abilityScores;
              const score = abilityScores[ability];
              const modifier = getModifier(score);
              const isValid = isAbilityScoreValid(ability, score);
              const recommendations = guidance?.recommendations[ability];

              return (
                <Card key={ability} className={!isValid ? "border-destructive" : ""}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Label htmlFor={`ability-${ability}`} className="flex items-center justify-between">
                        <span>{name}</span>
                        <Badge variant={modifier >= 0 ? "default" : "secondary"}>
                          {modifier >= 0 ? `+${modifier}` : modifier}
                        </Badge>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 text-lg font-semibold"
                          onClick={() => decrementAbility(ability)}
                          disabled={score <= 3}
                          data-testid={`button-decrease-${ability}`}
                        >
                          -
                        </Button>
                        <Input
                          id={`ability-${ability}`}
                          data-testid={`input-${ability}`}
                          type="number"
                          min="3"
                          max="50"
                          value={score}
                          onChange={(e) => updateAbilityScore(ability, parseInt(e.target.value) || 3)}
                          className={`text-center text-lg font-semibold ${getAbilityScoreColor(ability, score)}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 text-lg font-semibold"
                          onClick={() => incrementAbility(ability)}
                          disabled={score >= 50}
                          data-testid={`button-increase-${ability}`}
                        >
                          +
                        </Button>
                      </div>
                      {recommendations && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Recommended: </span>
                          {recommendations.range} - {recommendations.description}
                        </div>
                      )}
                      {!isValid && (
                        <div className="text-xs text-destructive">
                          Exceeds rank cap of {guidance?.rankCap}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Calculated Values Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Calculated Values (Preview)</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Note: Unlike heroes, threat defenses come from rank parameters only and are not modified by ability scores.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium">Avoidance:</span>
                <p>{params?.defenses[0] || 10}</p>
                <span className="text-xs text-muted-foreground">(From rank)</span>
              </div>
              <div>
                <span className="font-medium">Fortitude:</span>
                <p>{params?.defenses[1] || 10}</p>
                <span className="text-xs text-muted-foreground">(From rank)</span>
              </div>
              <div>
                <span className="font-medium">Willpower:</span>
                <p>{params?.defenses[2] || 10}</p>
                <span className="text-xs text-muted-foreground">(From rank)</span>
              </div>
              <div>
                <span className="font-medium">Initiative:</span>
                <p>+{Math.floor((abilityScores.dexterity - 10) / 2) + (params?.rankBonus || 1)}</p>
                <span className="text-xs text-muted-foreground">(Dex modifier)</span>
              </div>
              <div>
                <span className="font-medium">Pace:</span>
                <p>{2 + Math.max(0, Math.floor((abilityScores.dexterity - 10) / 4))} areas</p>
                <span className="text-xs text-muted-foreground">(Base + Dex)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Skill Sets
        </Button>
        <Button onClick={handleNext} data-testid="button-next">
          Next: Actions & Features
        </Button>
      </div>
    </div>
  );
}
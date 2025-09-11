import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Skull } from "lucide-react";
import { useThreat } from "@/context/ThreatContext";
import { ZOMBIE_FEATURES, SUPER_Z_FEATURES } from "@/data/zombieFeatures";
import { useEffect } from "react";

export default function Step7_Templates() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();

  useEffect(() => {
    // Auto-apply zombie/super-z features based on type
    if (threat.type === "Zombie") {
      applyZombieTemplate();
    } else if (threat.type === "Super Z") {
      applySuperZTemplate();
    }
  }, [threat.type]);

  const applyZombieTemplate = () => {
    // Apply zombie ability score changes
    const newAbilityScores = {
      ...threat.abilityScores,
      strength: Math.max(18, threat.abilityScores.strength), // Strength of the Damned
      intelligence: Math.min(4, threat.abilityScores.intelligence), // Bestial Instincts
      wisdom: Math.min(4, threat.abilityScores.wisdom),
      charisma: Math.min(4, threat.abilityScores.charisma)
    };
    
    updateThreatField("abilityScores", newAbilityScores);
    
    // Remove stamina, keep only wounds
    updateThreatField("stamina", 0);
    
    // Replace skill sets with zombie skill sets
    updateThreatField("skillSets", ["Zombie Senses", "Strength of the Damned"]);
  };

  const applySuperZTemplate = () => {
    // Apply Super Z ability score changes
    const newAbilityScores = {
      ...threat.abilityScores,
      strength: Math.max(20, threat.abilityScores.strength), // Enhanced strength
      intelligence: Math.min(4, threat.abilityScores.intelligence),
      wisdom: Math.min(4, threat.abilityScores.wisdom),
      charisma: Math.min(4, threat.abilityScores.charisma)
    };
    
    updateThreatField("abilityScores", newAbilityScores);
    
    // Remove stamina, keep only wounds, +1 wound
    updateThreatField("stamina", 0);
    updateThreatField("wounds", threat.wounds + 1);
    
    // Replace skill sets with zombie skill sets
    updateThreatField("skillSets", ["Enhanced Zombie Senses", "Strength of the Damned"]);
  };

  const handleNext = () => {
    setCurrentStep(8);
  };

  const handleBack = () => {
    setCurrentStep(6);
  };

  const isZombieType = threat.type === "Zombie" || threat.type === "Super Z";
  const featuresApplied = isZombieType ? (threat.type === "Zombie" ? ZOMBIE_FEATURES : SUPER_Z_FEATURES) : [];

  return (
    <div className="space-y-6" data-testid="step-templates">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              7
            </span>
            Apply Templates
          </CardTitle>
          <CardDescription>
            Templates modify threats based on their nature. Zombie and Super-Zombie templates are applied automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {!isZombieType && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <h4 className="font-semibold mb-2">No Template Required</h4>
              <p className="text-muted-foreground">
                Your {threat.type} threat doesn't require a special template. 
                Proceed to the next step to add actions and features.
              </p>
            </div>
          )}

          {threat.type === "Zombie" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Skull className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-semibold text-destructive">Zombie Template Applied</h4>
                  <p className="text-sm text-muted-foreground">
                    Your threat has been automatically modified with zombie characteristics.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Template Changes Applied:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Strength increased to minimum 18 (Strength of the Damned)</li>
                  <li>• Intelligence, Wisdom, Charisma reduced to 4 (Bestial Instincts)</li>
                  <li>• Stamina removed (zombies only have wounds)</li>
                  <li>• Skill sets replaced with zombie-appropriate sets</li>
                  <li>• Auto-features added (immunities, zombie bite, etc.)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Auto-Generated Features:</h4>
                <div className="grid gap-2">
                  {ZOMBIE_FEATURES.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="justify-start p-2">
                      <span className="font-medium">{feature.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({feature.type})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {threat.type === "Super Z" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-semibold text-destructive">Super-Zombie Template Applied</h4>
                  <p className="text-sm text-muted-foreground">
                    Your threat has been automatically modified with enhanced zombie characteristics.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Template Changes Applied:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Strength increased to minimum 20 (Enhanced Strength of the Damned)</li>
                  <li>• Intelligence, Wisdom, Charisma reduced to 4 (Bestial Instincts)</li>
                  <li>• Stamina removed (Super Z's only have wounds)</li>
                  <li>• +1 additional wound (Unnatural Endurance)</li>
                  <li>• Skill sets replaced with enhanced zombie sets</li>
                  <li>• Auto-features added (enhanced immunities, stronger bite, etc.)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Auto-Generated Features:</h4>
                <div className="grid gap-2">
                  {SUPER_Z_FEATURES.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="justify-start p-2">
                      <span className="font-medium">{feature.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">({feature.type})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other potential templates */}
          {threat.type === "Robot/Tech" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Construct Template</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Robot/Tech threats receive: +10 Stamina, immune to mind-affecting powers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Ability Scores
        </Button>
        <Button onClick={handleNext} data-testid="button-next">
          Next: Actions & Features
        </Button>
      </div>
    </div>
  );
}
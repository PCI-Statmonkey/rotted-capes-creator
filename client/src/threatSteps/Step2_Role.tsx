import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_ROLES } from "@/data/threatRoles";
import { useState } from "react";

const ROLE_DESCRIPTIONS = {
  "Skillful": {
    description: "Threats that rely on training, tactics, and specialized knowledge.",
    mechanics: "+1 Willpower",
    examples: "Elite soldiers, master thieves, skilled survivors"
  },
  "Striker": {
    description: "Fast, agile threats that hit hard and fast.",
    mechanics: "+10 Stamina, +1 to hit",
    examples: "Assassins, fast zombies, agile predators"
  },
  "Bruiser": {
    description: "Tough, heavy-hitting threats built to take and deal damage.",
    mechanics: "x2 Stamina, -1 Avoidance, -1 Willpower",
    examples: "Tanks, large abominations, armored enemies"
  },
  "Ranged": {
    description: "Threats that prefer to attack from a distance.",
    mechanics: "+1 to hit, +1 Avoidance",
    examples: "Snipers, energy blasters, archers"
  },
  "Controller": {
    description: "Threats that manipulate the battlefield and control enemies.",
    mechanics: "+1 to hit, -1 Avoidance",
    examples: "Psionics, trap masters, battlefield commanders"
  },
  "Lurker": {
    description: "Sneaky threats that ambush and use stealth tactics.",
    mechanics: "+1 to hit, +1 Avoidance",
    examples: "Stalkers, ambush predators, stealth operatives"
  },
  "Horde Leader": {
    description: "Threats that command other creatures or inspire followers.",
    mechanics: "No direct stat bonuses, gains minions/leadership abilities",
    examples: "Zombie masters, pack leaders, cult leaders"
  }
};

export default function Step2_Role() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const [selectedRole, setSelectedRole] = useState(threat.role);

  const handleNext = () => {
    updateThreatField("role", selectedRole);
    setCurrentStep(4); // Go to Step 4 (Type)
  };

  const handleBack = () => {
    setCurrentStep(2); // Go back to Step 2 (Defenses)
  };

  const canProceed = selectedRole;

  return (
    <div className="space-y-6" data-testid="step-role">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              3
            </span>
            Choose Role
          </CardTitle>
          <CardDescription>
            The role defines how your threat fights and what tactical niche it fills in encounters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {THREAT_ROLES.map((role) => {
              const roleInfo = ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS];
              return (
                <Card 
                  key={role} 
                  className={`cursor-pointer transition-all ${
                    selectedRole === role 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedRole(role)}
                  data-testid={`role-${role.toLowerCase().replace(/\\s+/g, '-')}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{role}</h3>
                          {selectedRole === role && (
                            <Badge>Selected</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{roleInfo.description}</p>
                        <div className="text-sm">
                          <span className="font-medium text-primary">Mechanics: </span>
                          <span>{roleInfo.mechanics}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium text-primary">Examples: </span>
                          <span className="text-muted-foreground">{roleInfo.examples}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Assign Defenses
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
          data-testid="button-next"
        >
          Next: Choose Type
        </Button>
      </div>
    </div>
  );
}
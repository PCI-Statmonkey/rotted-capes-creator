import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_TYPES } from "@/data/threatTypes";
import { useState } from "react";

const TYPE_DESCRIPTIONS = {
  "Animal": {
    description: "Natural creatures, often enhanced by the post-apocalyptic environment.",
    mechanics: "+1 Avoidance, -2 Discipline, Intelligence 3 or lower",
    examples: "Lions, wolves, mutated creatures, zoo escapees",
    template: "None"
  },
  "Survivor": {
    description: "Human survivors, both allies and adversaries.",
    mechanics: "No adjustment",
    examples: "Bandits, traders, community leaders, scavengers",
    template: "None"
  },
  "Abomination": {
    description: "Mutated humans and creatures, twisted by the apocalypse.",
    mechanics: "+1 Wound, -1 Avoidance, immune to frightened condition",
    examples: "Mutants, twisted experiments, genetic aberrations",
    template: "None"
  },
  "Powered Individual": {
    description: "Superheroes and supervillains still operating in the wasteland.",
    mechanics: "No adjustment — use base stats, may keep a Power Possessed list for reference",
    examples: "Heroes, villains, powered survivors",
    template: "None"
  },
  "Construct (Robot/Tech)": {
    description: "Artificial threats, from malfunctioning robots to killer drones.",
    mechanics: "+10 Stamina, immune to mind-affecting powers",
    examples: "Security bots, repair drones, AI systems",
    template: "Construct"
  },
  "Zombie": {
    description: "The shambling undead that caused the apocalypse. Automatically applies Survivor base type + Zombie template.",
    mechanics: "Uses Survivor base mechanics + Zombie Template overlay",
    examples: "Regular zombies, crawlers, runners",
    template: "Survivor + Zombie Template"
  },
  "Super Z": {
    description: "Powered zombies - the most dangerous undead threats. Automatically applies Powered Individual base type + Super-Zombie template.",
    mechanics: "Uses Powered Individual base mechanics + Super-Zombie Template overlay",
    examples: "Former heroes turned zombie, powered undead",
    template: "Powered Individual + Super-Zombie Template"
  }
};

export default function Step3_Type() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const [selectedType, setSelectedType] = useState(threat.type);

  const handleNext = () => {
    updateThreatField("type", selectedType);
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const canProceed = selectedType;

  return (
    <div className="space-y-6" data-testid="step-type">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              3
            </span>
            Choose Type
          </CardTitle>
          <CardDescription>
            The type determines the threat's fundamental nature and origin, affecting both mechanics and narrative role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {THREAT_TYPES.map((type) => {
              const typeInfo = TYPE_DESCRIPTIONS[type as keyof typeof TYPE_DESCRIPTIONS];
              return (
                <Card 
                  key={type} 
                  className={`cursor-pointer transition-all ${
                    selectedType === type 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedType(type)}
                  data-testid={`type-${type.toLowerCase().replace(/\\s+/g, '-')}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{type}</h3>
                          {selectedType === type && (
                            <Badge>Selected</Badge>
                          )}
                          {typeInfo.template !== "None" && (
                            <Badge variant="secondary">{typeInfo.template}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{typeInfo.description}</p>
                        <div className="text-sm">
                          <span className="font-medium text-primary">Mechanics: </span>
                          <span>{typeInfo.mechanics}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium text-primary">Examples: </span>
                          <span className="text-muted-foreground">{typeInfo.examples}</span>
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
          Back: Role
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
          data-testid="button-next"
        >
          Next: Choose Size
        </Button>
      </div>
    </div>
  );
}
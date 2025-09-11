import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_SIZES } from "@/data/threatSizes";
import { useState } from "react";

const SIZE_DESCRIPTIONS = {
  "Tiny/Smaller": {
    description: "Very small creatures or objects.",
    mechanics: "+2 Avoidance, -4 to grapple checks, can occupy same space as other creatures",
    examples: "House cats, rats, small drones, fairy-sized creatures",
    reach: "0 areas (must be adjacent)",
    space: "Less than 1 area"
  },
  "Small": {
    description: "Smaller than human-sized threats.",
    mechanics: "+1 Avoidance, -2 to grapple checks",
    examples: "Dogs, children, goblins, small robots",
    reach: "Melee (same area)",
    space: "1 area"
  },
  "Medium": {
    description: "Human-sized threats, the baseline for most encounters.",
    mechanics: "No size adjustments",
    examples: "Humans, zombies, most survivors, medium animals",
    reach: "Melee (same area)",
    space: "1 area"
  },
  "Large": {
    description: "Notably larger than humans, imposing physical presence.",
    mechanics: "-1 Avoidance, +2 to grapple checks, reach extends to adjacent areas",
    examples: "Horses, large zombies, cars, big abominations",
    reach: "Melee (1 area)",
    space: "2×2 areas"
  },
  "Huge": {
    description: "Massive creatures that dominate the battlefield.",
    mechanics: "-2 Avoidance, +4 to grapple checks, reach extends 2 areas",
    examples: "Elephants, large abominations, trucks, building-sized threats",
    reach: "Melee (2 areas)",
    space: "3×3 areas"
  },
  "Gargantuan": {
    description: "Truly colossal threats that reshape encounters.",
    mechanics: "-3 Avoidance, +6 to grapple checks, reach extends 3+ areas",
    examples: "Kaiju-scale abominations, massive constructs, living buildings",
    reach: "Melee (3+ areas)",
    space: "4×4+ areas"
  }
};

export default function Step4_Size() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const [selectedSize, setSelectedSize] = useState(threat.size);

  const handleNext = () => {
    updateThreatField("size", selectedSize);
    setCurrentStep(6); // Go to Step 6 (SkillSets)
  };

  const handleBack = () => {
    setCurrentStep(4); // Go back to Step 4 (Type)
  };

  const canProceed = selectedSize;

  return (
    <div className="space-y-6" data-testid="step-size">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              5
            </span>
            Choose Size
          </CardTitle>
          <CardDescription>
            Size affects reach, defense, and battlefield presence. Larger threats are harder to avoid but easier to hit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {THREAT_SIZES.map((size) => {
              const sizeInfo = SIZE_DESCRIPTIONS[size as keyof typeof SIZE_DESCRIPTIONS];
              return (
                <Card 
                  key={size} 
                  className={`cursor-pointer transition-all ${
                    selectedSize === size 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedSize(size)}
                  data-testid={`size-${size.toLowerCase().replace(/[\\s\\/]/g, '-')}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{size}</h3>
                          {selectedSize === size && (
                            <Badge>Selected</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{sizeInfo.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-primary">Mechanics: </span>
                            <span>{sizeInfo.mechanics}</span>
                          </div>
                          <div>
                            <span className="font-medium text-primary">Reach: </span>
                            <span>{sizeInfo.reach}</span>
                          </div>
                          <div>
                            <span className="font-medium text-primary">Space: </span>
                            <span>{sizeInfo.space}</span>
                          </div>
                          <div>
                            <span className="font-medium text-primary">Examples: </span>
                            <span className="text-muted-foreground">{sizeInfo.examples}</span>
                          </div>
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
          Back: Type
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
          data-testid="button-next"
        >
          Next: Skill Sets
        </Button>
      </div>
    </div>
  );
}
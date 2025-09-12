import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useThreat } from "@/context/ThreatContext";
import { useState } from "react";

// Type-specific skill sets based on threat type
const SKILL_SETS_BY_TYPE = {
  "Animal": [
    "Apex Predator",
    "Feline Reflexes", 
    "Pack Hunter",
    "Animal Instincts",
    "Silent Hunter",
    "Canopy Ghost",
    "Primate Survivor",
    "Scavenger",
    "Hunter"
  ],
  "Survivor": [
    "Caretaker",
    "Teacher", 
    "Handyman",
    "Cook",
    "Custodian",
    "Farmhand",
    "Librarian",
    "Bus Driver",
    "Janitor",
    "Parent",
    "Veteran",
    "Beat Cop",
    "Disaster Responder",
    "Field Engineer",
    "Medical Training"
  ],
  "Abomination": [
    "Apex Predator",
    "Urban Stalker",
    "Bestial Instincts", 
    "Enhanced Athletes",
    "Silent Hunter",
    "Nocturnal Hunter",
    "Abominable Guardian",
    "Hunter of the In-Between",
    "Way Too Clever"
  ],
  "Powered Individual": [
    "Visionary",
    "Urban Recon Training",
    "Ex-Military Operative",
    "Undercover Operative", 
    "Street Mechanic",
    "Cybercriminal",
    "Alien Scout",
    "Billionaire Playboy Philanthropist",
    "Strategic Command Training",
    "Gadgeteer Tinkerer",
    "Masked Detective",
    "Born to Wear the Mask",
    "Former Sidekick",
    "Superhero Support Specialist",
    "Trained Since Childhood"
  ],
  "Construct (Robot/Tech)": [
    "Targeting Algorithms",
    "Sensor Suite",
    "Mobility Protocols",
    "Security Doctrine", 
    "Maintenance Subroutines",
    "Industrial Tooling",
    "Legacy Technician",
    "Field Engineer",
    "Tech Specialist",
    "Scientific Fieldwork"
  ],
  "Zombie": [
    "Swarm Hunter",
    "Climbing Corps",
    "Zombie Senses",
    "Pack Hunter",
    "Silent Hunter",
    "Urban Stalker"
  ],
  "Super Z": [
    // Combines Zombie and Powered Individual skill sets
    "Swarm Hunter",
    "Climbing Corps", 
    "Zombie Senses",
    "Visionary",
    "Urban Recon Training",
    "Ex-Military Operative",
    "Undercover Operative",
    "Strategic Command Training",
    "Masked Detective",
    "Apex Predator",
    "Enhanced Athletes"
  ]
};

// Fallback skill sets if type not found or not selected
const DEFAULT_SKILL_SETS = [
  "Survivalist",
  "Combat Veteran", 
  "Animal Instincts",
  "Street Smart",
  "Academic",
  "Medical Training",
  "Mechanical Aptitude",
  "Leadership",
  "Stealth Operations",
  "Marksman"
];

export default function Step5_SkillSets() {
  const { threat, addSkillSet, removeSkillSet, setCurrentStep } = useThreat();
  const [customSkillSet, setCustomSkillSet] = useState("");

  const handleNext = () => {
    setCurrentStep(7); // Go to Step 7 (AbilityScores)
  };

  const handleBack = () => {
    setCurrentStep(5); // Go back to Step 5 (Size)
  };

  const addCustomSkillSet = () => {
    if (customSkillSet.trim()) {
      addSkillSet(customSkillSet.trim());
      setCustomSkillSet("");
    }
  };

  const addCommonSkillSet = (skillSet: string) => {
    if (!threat.skillSets.includes(skillSet)) {
      addSkillSet(skillSet);
    }
  };

  // Get appropriate skill sets based on threat type
  const getSkillSetsForType = () => {
    if (!threat.type || !SKILL_SETS_BY_TYPE[threat.type as keyof typeof SKILL_SETS_BY_TYPE]) {
      return DEFAULT_SKILL_SETS;
    }
    return SKILL_SETS_BY_TYPE[threat.type as keyof typeof SKILL_SETS_BY_TYPE];
  };

  const availableSkillSets = getSkillSetsForType();

  return (
    <div className="space-y-6" data-testid="step-skillsets">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              6
            </span>
            Skill Sets
          </CardTitle>
          <CardDescription>
            Create one or two Skill Sets reflecting the threat's training or instincts. Most threats have a single Skill Set, but highly trained or intelligent threats may have more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Skill Sets */}
          {threat.skillSets.length > 0 && (
            <div className="space-y-2">
              <Label>Current Skill Sets</Label>
              <div className="flex flex-wrap gap-2">
                {threat.skillSets.map((skillSet, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {skillSet}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSkillSet(index)}
                      data-testid={`remove-skillset-${index}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Skill Set */}
          <div className="space-y-2">
            <Label htmlFor="custom-skillset">Add Custom Skill Set</Label>
            <div className="flex gap-2">
              <Input
                id="custom-skillset"
                data-testid="input-custom-skillset"
                placeholder="Enter skill set name..."
                value={customSkillSet}
                onChange={(e) => setCustomSkillSet(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCustomSkillSet();
                  }
                }}
              />
              <Button 
                onClick={addCustomSkillSet}
                disabled={!customSkillSet.trim()}
                data-testid="button-add-custom-skillset"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Type-Appropriate Skill Sets */}
          <div className="space-y-2">
            <Label>
              {threat.type ? `${threat.type} Skill Sets` : "Common Skill Sets"}
            </Label>
            {threat.type && (
              <p className="text-sm text-muted-foreground">
                Skill sets appropriate for {threat.type} threats
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSkillSets.map((skillSet) => (
                <Button
                  key={skillSet}
                  variant={threat.skillSets.includes(skillSet) ? "default" : "outline"}
                  size="sm"
                  onClick={() => addCommonSkillSet(skillSet)}
                  disabled={threat.skillSets.includes(skillSet)}
                  data-testid={`skillset-${skillSet.toLowerCase().replace(/\\s+/g, '-')}`}
                  className="text-left justify-start"
                >
                  {skillSet}
                </Button>
              ))}
            </div>
          </div>

          {/* Guidance */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Skill Set Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Most threats have 1-2 skill sets</li>
              <li>• Highly trained or intelligent (Intelligence 20+) threats may have more</li>
              <li>• Choose sets that reflect the threat's background and nature</li>
              <li>• Animal threats typically have instinct-based sets like Apex Predator</li>
              <li>• Survivor threats have mundane profession-based skill sets</li>
              <li>• Zombie threats lose previous skill sets and gain Zombie Senses</li>
              <li>• Powered Individual threats have heroic training and advanced skill sets</li>
              <li>• Construct threats have algorithmic and technical skill sets</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Size
        </Button>
        <Button onClick={handleNext} data-testid="button-next">
          Next: Ability Scores
        </Button>
      </div>
    </div>
  );
}
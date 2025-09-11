import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_PARAMETERS, getThreatParameter } from "@/data/threatParameters";
import { useState } from "react";

export default function Step1_Rank() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const [name, setName] = useState(threat.name);
  const [selectedRank, setSelectedRank] = useState(threat.rank);

  const currentParams = getThreatParameter(selectedRank);

  const handleNext = () => {
    updateThreatField("name", name);
    updateThreatField("rank", selectedRank);
    
    // Apply threat parameters when rank is selected
    if (currentParams) {
      updateThreatField("defenses", {
        avoidance: currentParams.defenses[0],
        fortitude: currentParams.defenses[1], 
        willpower: currentParams.defenses[2]
      });
      updateThreatField("stamina", currentParams.stamina);
      updateThreatField("wounds", currentParams.wounds);
      updateThreatField("attack", {
        single: currentParams.toHit[0],
        area: currentParams.toHit[1]
      });
      updateThreatField("damage", currentParams.damage);
    }
    
    setCurrentStep(2);
  };

  const canProceed = name.trim() && selectedRank;

  return (
    <div className="space-y-6" data-testid="step-rank">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              1
            </span>
            Threat Basics & Rank
          </CardTitle>
          <CardDescription>
            Choose the threat's name and rank. The rank determines the baseline power level and narrative importance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="threat-name">Threat Name</Label>
            <Input
              id="threat-name"
              data-testid="input-threat-name"
              placeholder="Enter the threat's name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank-select">Threat Rank</Label>
            <Select value={selectedRank} onValueChange={setSelectedRank}>
              <SelectTrigger data-testid="select-rank">
                <SelectValue placeholder="Select threat rank..." />
              </SelectTrigger>
              <SelectContent>
                {THREAT_PARAMETERS.map((param) => (
                  <SelectItem key={param.label} value={param.label}>
                    <div className="flex items-center justify-between w-full">
                      <span>{param.label}</span>
                      <Badge variant="outline" className="ml-2">
                        Rank {param.rank}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentParams && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Rank {selectedRank} Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Rank Cap:</span>
                  <p>{currentParams.rankCap}</p>
                </div>
                <div>
                  <span className="font-medium">Rank Bonus:</span>
                  <p>+{currentParams.rankBonus}</p>
                </div>
                <div>
                  <span className="font-medium">Stamina:</span>
                  <p>{currentParams.stamina}</p>
                </div>
                <div>
                  <span className="font-medium">Wounds:</span>
                  <p>{currentParams.wounds}</p>
                </div>
                <div>
                  <span className="font-medium">Defenses:</span>
                  <p>{currentParams.defenses.join("/")}</p>
                </div>
                <div>
                  <span className="font-medium">To Hit:</span>
                  <p>{currentParams.toHit.join("/")}</p>
                </div>
                <div>
                  <span className="font-medium">Damage:</span>
                  <p>{currentParams.damage.min}-{currentParams.damage.max} (avg {currentParams.damage.avg})</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div></div>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
          data-testid="button-next"
        >
          Next: Choose Role
        </Button>
      </div>
    </div>
  );
}
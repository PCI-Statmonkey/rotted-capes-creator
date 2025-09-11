import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_PARAMETERS, getThreatParameter } from "@/data/threatParameters";
import { getRankLabels } from "@/utils/rank";
import { useState, useEffect } from "react";

export default function Step1_Rank() {
  const { threat, updateThreatField, setCurrentStep, applyParameters, applyAdvancedParameters } = useThreat();
  const [name, setName] = useState(threat.name);
  const [selectedRank, setSelectedRank] = useState(threat.rank);
  const [useAdvancedDesign, setUseAdvancedDesign] = useState(threat.advanced || false);
  
  // Advanced ranking state
  const [attackRank, setAttackRank] = useState(threat.advancedRanks?.attack || threat.rank);
  const [defenseRank, setDefenseRank] = useState(threat.advancedRanks?.defense || threat.rank);
  const [durabilityRank, setDurabilityRank] = useState(threat.advancedRanks?.durability || threat.rank);
  
  const rankLabels = getRankLabels();

  const currentParams = getThreatParameter(selectedRank);

  const handleNext = () => {
    updateThreatField("name", name);
    
    if (useAdvancedDesign) {
      // Use advanced parameters with three separate rankings
      applyAdvancedParameters(defenseRank, durabilityRank, attackRank);
    } else {
      // Use simple single rank parameters
      applyParameters(selectedRank);
    }
    
    setCurrentStep(2);
  };

  const canProceed = name.trim() && (useAdvancedDesign ? (attackRank && defenseRank && durabilityRank) : selectedRank);

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

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="advanced-design" 
              checked={useAdvancedDesign}
              onCheckedChange={(checked) => setUseAdvancedDesign(!!checked)}
              data-testid="checkbox-advanced-design"
            />
            <Label 
              htmlFor="advanced-design" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Advanced Threat Design: Threat Parameters
            </Label>
          </div>

          {!useAdvancedDesign ? (
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
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attack-rank">Attack Rank</Label>
                  <Select value={attackRank} onValueChange={setAttackRank}>
                    <SelectTrigger data-testid="select-attack-rank">
                      <SelectValue placeholder="Attack rank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rankLabels.map((label) => (
                        <SelectItem key={`attack-${label}`} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defense-rank">Defense Rank</Label>
                  <Select value={defenseRank} onValueChange={setDefenseRank}>
                    <SelectTrigger data-testid="select-defense-rank">
                      <SelectValue placeholder="Defense rank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rankLabels.map((label) => (
                        <SelectItem key={`defense-${label}`} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durability-rank">Durability Rank</Label>
                  <Select value={durabilityRank} onValueChange={setDurabilityRank}>
                    <SelectTrigger data-testid="select-durability-rank">
                      <SelectValue placeholder="Durability rank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rankLabels.map((label) => (
                        <SelectItem key={`durability-${label}`} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Final Calculated Rank</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The threat's final rank will be calculated as the average of Attack ({attackRank}), Defense ({defenseRank}), and Durability ({durabilityRank}).
                </p>
                <p className="text-sm">
                  <span className="font-medium">Resulting Rank:</span> {
                    attackRank && defenseRank && durabilityRank 
                      ? (() => {
                          const attackVal = THREAT_PARAMETERS.find(p => p.label === attackRank)?.rank || 0;
                          const defenseVal = THREAT_PARAMETERS.find(p => p.label === defenseRank)?.rank || 0;
                          const durabilityVal = THREAT_PARAMETERS.find(p => p.label === durabilityRank)?.rank || 0;
                          const avg = (attackVal + defenseVal + durabilityVal) / 3;
                          const closest = THREAT_PARAMETERS.reduce((prev, curr) =>
                            Math.abs(curr.rank - avg) < Math.abs(prev.rank - avg) ? curr : prev
                          );
                          return `${closest.label} (${avg.toFixed(2)} average)`;
                        })()
                      : "Select all ranks to see result"
                  }
                </p>
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
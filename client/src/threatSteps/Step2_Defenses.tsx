import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { useState } from "react";

export default function Step2_Defenses() {
  const { threat, commitDefenseAssignment, setCurrentStep } = useThreat();
  
  // Local state for the defense assignments
  const [avoidanceValue, setAvoidanceValue] = useState<number | null>(null);
  const [fortitudeValue, setFortitudeValue] = useState<number | null>(null);
  const [willpowerValue, setWillpowerValue] = useState<number | null>(null);

  if (!threat.pendingDefenseValues) {
    // This shouldn't happen if navigation is correct, but handle gracefully
    return (
      <div className="space-y-6" data-testid="step-defenses-error">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No defense values to assign. Please go back and select a rank first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableValues = threat.pendingDefenseValues;
  const usedValues = [avoidanceValue, fortitudeValue, willpowerValue].filter(v => v !== null);
  
  const getAvailableOptions = (currentValue: number | null) => {
    return availableValues.filter(value => 
      value === currentValue || !usedValues.includes(value)
    );
  };

  const allAssigned = avoidanceValue !== null && fortitudeValue !== null && willpowerValue !== null;
  const allUnique = new Set(usedValues).size === usedValues.length;
  const canProceed = allAssigned && allUnique;

  const handleNext = () => {
    if (!canProceed || avoidanceValue === null || fortitudeValue === null || willpowerValue === null) {
      return;
    }

    commitDefenseAssignment({
      avoidance: avoidanceValue,
      fortitude: fortitudeValue,
      willpower: willpowerValue,
    });
    
    setCurrentStep(3); // Move to next step (Role)
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6" data-testid="step-defenses">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              2
            </span>
            Assign Defense Values
          </CardTitle>
          <CardDescription>
            Your {threat.advanced ? `${threat.advancedRanks?.defense} defense rank` : `${threat.rank} rank`} provides these defense values. 
            Choose which value goes to each defense type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show available defense values */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Available Defense Values</h4>
            <div className="flex gap-2">
              {availableValues.map((value, index) => (
                <Badge 
                  key={index} 
                  variant={usedValues.includes(value) ? "default" : "outline"}
                  className="text-lg px-3 py-1"
                  data-testid={`badge-defense-value-${value}`}
                >
                  {value}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Assign each value to exactly one defense type below.
            </p>
          </div>

          {/* Defense assignment dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avoidance-select">Avoidance</Label>
              <Select 
                value={avoidanceValue?.toString() || ""} 
                onValueChange={(value) => setAvoidanceValue(parseInt(value))}
              >
                <SelectTrigger data-testid="select-avoidance">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(avoidanceValue).map((value) => (
                    <SelectItem key={`avoidance-${value}`} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your ability to dodge attacks and avoid dangers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fortitude-select">Fortitude</Label>
              <Select 
                value={fortitudeValue?.toString() || ""} 
                onValueChange={(value) => setFortitudeValue(parseInt(value))}
              >
                <SelectTrigger data-testid="select-fortitude">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(fortitudeValue).map((value) => (
                    <SelectItem key={`fortitude-${value}`} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your resistance to physical harm and diseases
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="willpower-select">Discipline (Willpower)</Label>
              <Select 
                value={willpowerValue?.toString() || ""} 
                onValueChange={(value) => setWillpowerValue(parseInt(value))}
              >
                <SelectTrigger data-testid="select-willpower">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(willpowerValue).map((value) => (
                    <SelectItem key={`willpower-${value}`} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your mental resistance and force of will
              </p>
            </div>
          </div>

          {/* Assignment preview */}
          {(avoidanceValue || fortitudeValue || willpowerValue) && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Current Assignment</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Avoidance:</span>
                  <p className={avoidanceValue ? "text-primary" : "text-muted-foreground"}>
                    {avoidanceValue || "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Fortitude:</span>
                  <p className={fortitudeValue ? "text-primary" : "text-muted-foreground"}>
                    {fortitudeValue || "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Discipline:</span>
                  <p className={willpowerValue ? "text-primary" : "text-muted-foreground"}>
                    {willpowerValue || "Not assigned"}
                  </p>
                </div>
              </div>
              {!canProceed && allAssigned && !allUnique && (
                <p className="text-destructive text-sm mt-2">
                  Each defense must have a unique value. Please reassign duplicates.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Rank & Basics
        </Button>
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
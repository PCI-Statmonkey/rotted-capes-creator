import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";
import { useState } from "react";

export default function Step2_Defenses() {
  const { threat, commitDefenseAssignment, setCurrentStep } = useThreat();
  
  // Local state for the defense assignments - now tracking array indices instead of values
  const [avoidanceIndex, setAvoidanceIndex] = useState<number | null>(null);
  const [fortitudeIndex, setFortitudeIndex] = useState<number | null>(null);
  const [willpowerIndex, setWillpowerIndex] = useState<number | null>(null);
  
  // State for click-to-assign interface
  const [selectedValueIndex, setSelectedValueIndex] = useState<number | null>(null);

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
  const usedIndices = [avoidanceIndex, fortitudeIndex, willpowerIndex].filter(i => i !== null);
  const usedValues = usedIndices.map(i => availableValues[i!]).filter(v => v !== undefined);
  
  const getAvailableOptions = (currentIndex: number | null) => {
    return availableValues.map((value, index) => ({ value, index }))
      .filter(({ index }) => index === currentIndex || !usedIndices.includes(index));
  };

  const allAssigned = avoidanceIndex !== null && fortitudeIndex !== null && willpowerIndex !== null;
  const allUnique = new Set(usedIndices).size === usedIndices.length;
  const canProceed = allAssigned && allUnique;

  const handleNext = () => {
    if (!canProceed || avoidanceIndex === null || fortitudeIndex === null || willpowerIndex === null) {
      return;
    }

    commitDefenseAssignment({
      avoidance: availableValues[avoidanceIndex],
      fortitude: availableValues[fortitudeIndex],
      willpower: availableValues[willpowerIndex],
    });
    
    setCurrentStep(3); // Move to next step (Role)
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  // Click-to-assign handlers
  const handleValueClick = (index: number) => {
    if (usedIndices.includes(index)) {
      // If value is already used, deselect it and clear from defenses
      if (avoidanceIndex === index) setAvoidanceIndex(null);
      if (fortitudeIndex === index) setFortitudeIndex(null);
      if (willpowerIndex === index) setWillpowerIndex(null);
      setSelectedValueIndex(null);
    } else {
      // Select this value for assignment
      setSelectedValueIndex(index);
    }
  };

  const handleDefenseClick = (defenseType: 'avoidance' | 'fortitude' | 'willpower') => {
    if (selectedValueIndex === null) return;
    
    // Clear any previous assignment of this value
    if (avoidanceIndex === selectedValueIndex) setAvoidanceIndex(null);
    if (fortitudeIndex === selectedValueIndex) setFortitudeIndex(null);
    if (willpowerIndex === selectedValueIndex) setWillpowerIndex(null);
    
    // Assign to the clicked defense
    switch (defenseType) {
      case 'avoidance':
        setAvoidanceIndex(selectedValueIndex);
        break;
      case 'fortitude':
        setFortitudeIndex(selectedValueIndex);
        break;
      case 'willpower':
        setWillpowerIndex(selectedValueIndex);
        break;
    }
    
    // Clear selection after assignment
    setSelectedValueIndex(null);
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
                  variant={usedIndices.includes(index) ? "default" : selectedValueIndex === index ? "secondary" : "outline"}
                  className={`text-lg px-3 py-1 cursor-pointer transition-colors hover:bg-primary/20 ${
                    selectedValueIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleValueClick(index)}
                  data-testid={`badge-defense-value-${value}-${index}`}
                >
                  {value}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                {selectedValueIndex !== null ? (
                  <>Click a defense below to assign <strong>{availableValues[selectedValueIndex]}</strong>, or use the dropdowns.</>
                ) : (
                  "Click a value above then click a defense below to assign, or use the dropdowns."
                )}
              </p>
              {(avoidanceIndex !== null || fortitudeIndex !== null || willpowerIndex !== null) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setAvoidanceIndex(null);
                    setFortitudeIndex(null);
                    setWillpowerIndex(null);
                    setSelectedValueIndex(null);
                  }}
                  data-testid="button-reset-defenses"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Reset All
                </Button>
              )}
            </div>
          </div>

          {/* Defense assignment - clickable + dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`space-y-2 p-3 rounded-lg border-2 transition-colors ${
              selectedValueIndex !== null ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5" : ""
            } ${avoidanceIndex !== null ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => selectedValueIndex !== null && handleDefenseClick('avoidance')}
            >
              <Label htmlFor="avoidance-select" className="flex items-center justify-between">
                Avoidance
                {avoidanceIndex !== null && (
                  <Badge variant="secondary" className="text-lg">
                    {availableValues[avoidanceIndex]}
                  </Badge>
                )}
              </Label>
              <Select 
                value={avoidanceIndex?.toString() || ""} 
                onValueChange={(value) => setAvoidanceIndex(parseInt(value))}
              >
                <SelectTrigger data-testid="select-avoidance">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(avoidanceIndex).map(({ value, index }) => (
                    <SelectItem key={`avoidance-${index}`} value={index.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your ability to dodge attacks and avoid dangers
              </p>
            </div>

            <div className={`space-y-2 p-3 rounded-lg border-2 transition-colors ${
              selectedValueIndex !== null ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5" : ""
            } ${fortitudeIndex !== null ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => selectedValueIndex !== null && handleDefenseClick('fortitude')}
            >
              <Label htmlFor="fortitude-select" className="flex items-center justify-between">
                Fortitude
                {fortitudeIndex !== null && (
                  <Badge variant="secondary" className="text-lg">
                    {availableValues[fortitudeIndex]}
                  </Badge>
                )}
              </Label>
              <Select 
                value={fortitudeIndex?.toString() || ""} 
                onValueChange={(value) => setFortitudeIndex(parseInt(value))}
              >
                <SelectTrigger data-testid="select-fortitude">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(fortitudeIndex).map(({ value, index }) => (
                    <SelectItem key={`fortitude-${index}`} value={index.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your resistance to physical harm and diseases
              </p>
            </div>

            <div className={`space-y-2 p-3 rounded-lg border-2 transition-colors ${
              selectedValueIndex !== null ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5" : ""
            } ${willpowerIndex !== null ? "border-primary/30 bg-primary/5" : "border-border"}`}
            onClick={() => selectedValueIndex !== null && handleDefenseClick('willpower')}
            >
              <Label htmlFor="willpower-select" className="flex items-center justify-between">
                Discipline (Willpower)
                {willpowerIndex !== null && (
                  <Badge variant="secondary" className="text-lg">
                    {availableValues[willpowerIndex]}
                  </Badge>
                )}
              </Label>
              <Select 
                value={willpowerIndex?.toString() || ""} 
                onValueChange={(value) => setWillpowerIndex(parseInt(value))}
              >
                <SelectTrigger data-testid="select-willpower">
                  <SelectValue placeholder="Choose value..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOptions(willpowerIndex).map(({ value, index }) => (
                    <SelectItem key={`willpower-${index}`} value={index.toString()}>
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
          {(avoidanceIndex !== null || fortitudeIndex !== null || willpowerIndex !== null) && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Current Assignment</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Avoidance:</span>
                  <p className={avoidanceIndex !== null ? "text-primary" : "text-muted-foreground"}>
                    {avoidanceIndex !== null ? availableValues[avoidanceIndex] : "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Fortitude:</span>
                  <p className={fortitudeIndex !== null ? "text-primary" : "text-muted-foreground"}>
                    {fortitudeIndex !== null ? availableValues[fortitudeIndex] : "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Discipline:</span>
                  <p className={willpowerIndex !== null ? "text-primary" : "text-muted-foreground"}>
                    {willpowerIndex !== null ? availableValues[willpowerIndex] : "Not assigned"}
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
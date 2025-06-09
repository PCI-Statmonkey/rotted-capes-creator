import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SkillCardProps {
  skill: {
    name: string;
    ability: string;
  };
  isSelected: boolean;
  focuses: string[];
  onToggle: () => void;
  onFocusChange: (index: number, focus: string) => void;
  autoSelected?: boolean;
  freeFocus?: boolean;
  focusOptions?: string[];
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isSelected,
  focuses,
  onToggle,
  onFocusChange,
  autoSelected = false,
  freeFocus = false,
  focusOptions = [],
}) => {
  return (
    <div
      className={`mb-2 p-2 border rounded ${
        autoSelected ? "bg-accent/20 border-accent" : "border-gray-700"
      }`}
    >
      <Label className="flex items-center gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={autoSelected}
        />
        {skill.name} ({skill.ability})
        {freeFocus && (
          <Badge variant="secondary" className="ml-2">
            Free Focus
          </Badge>
        )}
      </Label>
      {isSelected && (
        <div className="mt-1 space-y-1">
          {focuses.map((f, i) => {
            const isCustom = f !== "" && !focusOptions.includes(f);
            return (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="border rounded p-1 text-black"
                  value={isCustom ? "custom" : f}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "custom") {
                      onFocusChange(i, "");
                    } else {
                      onFocusChange(i, value);
                    }
                  }}
                >
                  <option value="">Select Focus</option>
                  {focusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="custom">Player Defined</option>
                </select>
                {isCustom && (
                  <Input
                    placeholder="Enter focus"
                    value={f}
                    onChange={(e) => onFocusChange(i, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SkillCard;

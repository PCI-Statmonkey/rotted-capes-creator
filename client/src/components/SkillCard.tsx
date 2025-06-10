import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SkillCardProps {
  skill: {
    name: string;
    ability: string;
    focusOptions?: string[];
  };
  isSelected: boolean;
  focuses: string[];
  onToggle: () => void;
  onFocusChange: (index: number, focus: string) => void;
  onAddFocus: () => void;
  autoSelected?: boolean;
  freeFocus?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isSelected,
  focuses,
  onToggle,
  onFocusChange,
  onAddFocus,
  autoSelected = false,
  freeFocus = false,
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
            // Show an input field when the user selects "User Defined Focus"
            // or when the current focus is not part of the predefined options
            const isCustom = f === "" || !skill.focusOptions?.includes(f);
            return (
              <div key={i} className="flex gap-2 items-center">
                {isCustom ? (
                  <Input
                    placeholder="Custom focus"
                    value={f}
                    onChange={(e) => onFocusChange(i, e.target.value)}
                  />
                ) : (
                  <Select
                    value={f}
                    onValueChange={(val) => {
                      if (val === "__custom__") onFocusChange(i, "");
                      else onFocusChange(i, val);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select focus" />
                    </SelectTrigger>
                    <SelectContent>
                      {skill.focusOptions?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">User Defined Focus</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
          <Button type="button" onClick={onAddFocus} size="sm">
            Add Focus
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillCard;

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
  /** Remove a focus at the given index */
  onRemoveFocus: (index: number) => void;
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
  onRemoveFocus,
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
        {skill.name}
        {freeFocus && (
          <Badge variant="secondary" className="ml-2">
            Free Focus
          </Badge>
        )}
      </Label>
      {isSelected && (
        <div className="mt-1 space-y-1">
          {focuses.map((f, i) => {
            const isCustom =
              f === "__custom__" || (f !== "" && !skill.focusOptions?.includes(f));
            return (
              <div key={i} className="flex gap-2 items-center">
                {isCustom ? (
                  <Input
                    placeholder="Custom focus"
                    value={f === "__custom__" ? "" : f}
                    onChange={(e) => onFocusChange(i, e.target.value)}
                  />
                ) : (
                  <Select
                    value={f}
                    onValueChange={(val) => {
                      onFocusChange(i, val);
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
                {/* Free focus indicator shown next to skill name */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveFocus(i)}
                >
                  ×
                </Button>
              </div>
            );
          })}
          <Button type="button" onClick={onAddFocus} size="sm">
            Add Focus (+1 pt)
          </Button>
        </div>
      )}
    </div>
  );
};

export default SkillCard;

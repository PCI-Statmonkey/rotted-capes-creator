import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SkillCardProps {
  skill: {
    name: string;
    ability: string;
  };
  isSelected: boolean;
  focus: string;
  onToggle: () => void;
  onFocusChange: (focus: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isSelected,
  focus,
  onToggle,
  onFocusChange,
}) => {
  return (
    <div className="mb-2 p-2 border border-gray-700 rounded">
      <Label className="flex items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        {skill.name} ({skill.ability})
      </Label>
      {isSelected && (
        <Input
          placeholder="Focus (optional)"
          value={focus}
          onChange={(e) => onFocusChange(e.target.value)}
          className="mt-1"
        />
      )}
    </div>
  );
};

export default SkillCard;

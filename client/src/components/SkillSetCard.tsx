import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SkillSetCardProps {
  set: {
    name: string;
    points: number;
    description: string;
    skills?: (string | { name: string })[];
    feats?: (string | { name: string })[];
  };
  isSelected: boolean;
  onToggle: () => void;
}

const SkillSetCard: React.FC<SkillSetCardProps> = ({
  set,
  isSelected,
  onToggle,
}) => {
  return (
    <div className="mb-2 p-2 border border-gray-700 rounded">
      <Label className="flex items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        {set.name} ({set.points} pts)
      </Label>
      <div className="text-xs text-gray-400">{set.description}</div>

      {isSelected && (
        <div className="mt-2 font-sans">
          {(set.skills?.length ?? 0) > 0 && (
            <>
              <div className="text-sm text-white font-semibold mb-1">Skills Gained:</div>
              <ul className="text-sm text-white list-disc list-inside">
                {set.skills?.map((skill) => {
                  const label = typeof skill === 'string' ? skill : skill.name;
                  return <li key={label}>{label}</li>;
                })}
              </ul>
            </>
          )}
          {(set.feats?.length ?? 0) > 0 && (
            <>
              <div className="text-sm text-white font-semibold mt-2 mb-1">Feats Gained:</div>
              <ul className="text-sm text-white list-disc list-inside">
                {set.feats?.map((feat) => {
                  const label = typeof feat === 'string' ? feat : feat.name;
                  return <li key={label}>{label}</li>;
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillSetCard;

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Prerequisite {
  type: string;
  name: string;
}

interface Maneuver {
  name: string;
}

interface FeatCardProps {
  feat: {
    name: string;
    description: string;
    prerequisites?: Prerequisite[];
  };
  isSelected: boolean;
  isDisabled: boolean;
  missingPrereqs: string[];
  onToggle: (checked: boolean) => void;
  index?: number; // for "Learn Maneuver"
  showDropdown?: boolean;
  maneuvers?: Maneuver[];
  selectedManeuver?: string;
  onSelectManeuver?: (maneuverName: string) => void;
}

const FeatCard: React.FC<FeatCardProps> = ({
  feat,
  isSelected,
  isDisabled,
  missingPrereqs,
  onToggle,
  index,
  showDropdown,
  maneuvers,
  selectedManeuver,
  onSelectManeuver,
}) => {
  return (
    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mb-2">
      <Label
        title={isDisabled ? "You don’t meet the prerequisites for this feat" : ""}
        className={`flex items-center gap-2 ${
          isDisabled
            ? "opacity-50 text-gray-400 cursor-not-allowed pointer-events-none"
            : ""
        }`}
      >
        <Checkbox
          disabled={isDisabled}
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(!!checked)}
        />
        {feat.name} — {feat.description}
      </Label>
      {isDisabled && (
        <div className="text-xs text-gray-400 mt-1">
          Missing: {missingPrereqs.join(", ")}
        </div>
      )}

      {showDropdown && maneuvers && (
        <div className="mt-2">
          <label className="text-white text-sm mb-1 block">
            Select Maneuver {index !== undefined ? `#${index + 1}` : ""}
          </label>
          <select
            value={selectedManeuver || ""}
            onChange={(e) => onSelectManeuver?.(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          >
            <option value="">-- Select --</option>
            {maneuvers.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FeatCard;

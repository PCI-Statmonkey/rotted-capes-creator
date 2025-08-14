import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { parsePrerequisite, formatPrerequisite } from "@/utils/requirementValidator";
import { displayFeatName } from "@/lib/utils";

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
    type?: string;
    prerequisites?: Prerequisite[];
    options?: string[];
    usesPerScene?: number;
    stance?: boolean;
  };
  isSelected: boolean;
  isDisabled: boolean;
  missingPrereqs: any[];
  onToggle: (checked: boolean) => void;
  index?: number; // for "Learn Maneuver"
  showDropdown?: boolean;
  maneuvers?: Maneuver[];
  selectedManeuver?: string;
  onSelectManeuver?: (maneuverName: string) => void;
  source?: string;
  locked?: boolean;
  autoSelected?: boolean;
  children?: React.ReactNode;
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
  source,
  locked,
  autoSelected = false,
  children,
}) => {
  const prereqList = Array.isArray(feat.prerequisites)
    ? feat.prerequisites
    : feat.prerequisites
    ? [feat.prerequisites]
    : [];

  const parsedPrereqs = prereqList.flatMap((p) =>
    typeof p === "string" ? parsePrerequisite(p as any) : [p]
  );

  const formatReq = (req: any) => formatPrerequisite(req);

  const missingStrings = missingPrereqs.map(formatReq);
  return (
    <div
      className={`p-3 rounded-lg border mb-2 ${
        autoSelected ? 'bg-accent/20 border-accent' : 'bg-gray-800 border-gray-700'
      } ${isDisabled && !autoSelected ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Label
        title={isDisabled ? "You don’t meet the prerequisites for this feat" : ""}
        className="flex items-start gap-2"
      >
        <Checkbox
          disabled={isDisabled || locked}
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(!!checked)}
          className="mt-1"
        />
        <div>
          <div className="font-semibold text-white">
            {displayFeatName(feat.name)}
          </div>
          <div className="text-white text-sm">{feat.description}</div>
          {feat.usesPerScene !== undefined && (
            <div className="text-xs text-white mt-1">
              Uses per scene: {feat.usesPerScene}
            </div>
          )}
          {source && (
            <div className="text-xs text-accent mt-1">Free from {source}</div>
          )}
        </div>
      </Label>
      {parsedPrereqs.length > 0 && (
        <div className="text-xs mt-1 ml-6 font-comic-light">
          <span className="font-semibold text-white">Prerequisites:</span>
          <ul className="list-disc pl-5 mt-1">
            {parsedPrereqs.map((req, idx) => {
              const text = formatReq(req);
              const missing = missingStrings.includes(text);
              return (
                <li key={idx} className={missing ? "text-red-500" : "text-white"}>
                  {text}
                </li>
              );
            })}
          </ul>
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
      {isSelected && children}
    </div>
  );
};

export default FeatCard;

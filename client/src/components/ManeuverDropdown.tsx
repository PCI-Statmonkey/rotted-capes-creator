import React from "react";

interface ManeuverDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maneuvers: any[];
  meetsPrerequisites: (item: any) => boolean;
  getMissingPrereqs: (item: any) => any[];
}

const ManeuverDropdown: React.FC<ManeuverDropdownProps> = ({
  label,
  value,
  onChange,
  maneuvers,
  meetsPrerequisites,
  getMissingPrereqs,
}) => {
  return (
    <div className="mt-2">
      <label className="text-white text-sm mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="">-- Select Maneuver --</option>
        {maneuvers.map((m) => {
          const reqObj = { prerequisites: m.requirements };
          const disabled = !meetsPrerequisites(reqObj);
          return (
            <option
              key={m.name}
              value={m.name}
              disabled={disabled}
              title={
                disabled
                  ? `Missing: ${getMissingPrereqs(reqObj)
                      .map((p) => p.name)
                      .join(", ")}`
                  : ""
              }
              className={disabled ? "text-gray-400" : ""}
            >
              {m.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default ManeuverDropdown;

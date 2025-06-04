import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface StartingTabProps {
  basicStartingSkills: string[];
  startingSkills: string[];
  toggleStartingSkill: (skill: string) => void;

  startingFeat: string;
  setStartingFeat: (feat: string) => void;

  selectedManeuver: string;
  setSelectedManeuver: (maneuver: string) => void;

  feats: any[];
  maneuvers: any[];
  meetsPrerequisites: (item: any) => boolean;
  getMissingPrereqs: (item: any) => any[];
}

const StartingTab = ({
  basicStartingSkills,
  startingSkills,
  toggleStartingSkill,
  startingFeat,
  setStartingFeat,
  selectedManeuver,
  setSelectedManeuver,
  feats,
  maneuvers,
  meetsPrerequisites,
  getMissingPrereqs
}: StartingTabProps) => {
  return (
    <>
      <h3 className="text-white text-md mb-2">Select 2 Starting Skills</h3>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {basicStartingSkills.map((skill) => (
          <Button
            key={skill}
            variant={startingSkills.includes(skill) ? "default" : "outline"}
            onClick={() => toggleStartingSkill(skill)}
          >
            {skill}
          </Button>
        ))}
      </div>

      <h3 className="text-white text-md mb-2">Choose a Starting Feat</h3>
      <select
        value={startingFeat || ""}
        onChange={(e) => setStartingFeat(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="">-- Select --</option>
        {feats.map((f) => {
          const disabled = !meetsPrerequisites(f);
          return (
            <option
              key={f.name}
              value={f.name}
              disabled={disabled}
              title={
                disabled
                  ? `Missing: ${getMissingPrereqs(f)
                      .map((p) => p.name)
                      .join(", ")}`
                  : ""
              }
              className={disabled ? "text-gray-400" : ""}
            >
              {f.name}
            </option>
          );
        })}
      </select>

      <h3 className="text-white text-md mb-2 mt-4">Choose a Starting Maneuver</h3>
      <select
        value={selectedManeuver || ""}
        onChange={(e) => setSelectedManeuver(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="">-- Select --</option>
        {maneuvers.map((m) => {
          const disabled = !meetsPrerequisites(m);
          return (
            <option
              key={m.name}
              value={m.name}
              disabled={disabled}
              title={
                disabled
                  ? `Missing: ${getMissingPrereqs(m)
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
    </>
  );
};

export default StartingTab;

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parsePrerequisite } from "@/utils/requirementValidator";

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
  const selectedFeatObj = feats.find((f) => f.name === startingFeat);

  const prereqList = selectedFeatObj
    ? Array.isArray(selectedFeatObj.prerequisites)
      ? selectedFeatObj.prerequisites
      : selectedFeatObj.prerequisites
      ? [selectedFeatObj.prerequisites]
      : []
    : [];

  const parsedPrereqs = prereqList.flatMap((p: any) =>
    typeof p === "string" ? parsePrerequisite(p as any) : [p]
  );

  const formatReq = (req: any) =>
    typeof req === "object"
      ? req.type === "ability"
        ? `${req.name} ${req.value}`
        : req.type === "feat"
        ? `Feat: ${req.name}`
        : req.name
      : String(req);

  const missingPrereqs = selectedFeatObj ? getMissingPrereqs(selectedFeatObj) : [];
  const missingStrings = missingPrereqs.map(formatReq);
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
        {feats.map((f, index) => {
          const missing = getMissingPrereqs(f);
          const disabled = missing.length > 0;
          return (
            <option
              key={f.id ? String(f.id) : `${f.name}-${index}`}
              value={f.name}
              disabled={disabled}
              title={
                disabled
                  ? `Missing: ${missing
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
      {selectedFeatObj && parsedPrereqs.length > 0 && (
        <div className="text-xs mt-1">
          <span className="font-semibold text-white">Prerequisites:</span>
          <ul className="list-disc pl-5 mt-1">
            {parsedPrereqs.map((req: any, idx: number) => {
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

      <h3 className="text-white text-md mb-2 mt-4">Choose a Starting Maneuver</h3>
      <select
        value={selectedManeuver || ""}
        onChange={(e) => setSelectedManeuver(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="">-- Select --</option>
        {maneuvers.map((m) => {
          const missing = getMissingPrereqs(m);
          const disabled = missing.length > 0;
          return (
            <option
              key={m.name}
              value={m.name}
              disabled={disabled}
              title={
                disabled
                  ? `Missing: ${missing
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

import { Button } from "@/components/ui/button";
import { parsePrerequisite, formatPrerequisite } from "@/utils/requirementValidator";

interface StartingTabProps {
  basicStartingSkills: string[];
  startingSkills: string[];
  toggleStartingSkill: (skill: string) => void;

  startingFeat: string;
  setStartingFeat: (feat: string) => void;

  feats: any[];
  getMissingPrereqs: (item: any) => any[];
}

const StartingTab = ({
  basicStartingSkills,
  startingSkills,
  toggleStartingSkill,
  startingFeat,
  setStartingFeat,
  feats,
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

  const formatReq = (req: any) => formatPrerequisite(req);

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

    </>
  );
};

export default StartingTab;

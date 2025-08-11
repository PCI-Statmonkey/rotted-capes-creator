import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SkillSetCardProps {
  set: {
    name: string;
    points: number;
    description: string;
    ability?: string;
    skills?: (string | { name: string })[];
    feats?: (string | { name: string })[];
  };
  isSelected: boolean;
  selectedEdges: string[];
  deepCutTrigger?: string;
  edgeOptions?: string[];
  onToggle: () => void;
  onEdgesChange: (edges: string[]) => void;
  onDeepCutChange: (value: string) => void;
}

const SkillSetCard: React.FC<SkillSetCardProps> = ({
  set,
  isSelected,
  selectedEdges,
  deepCutTrigger,
  edgeOptions = [],
  onToggle,
  onEdgesChange,
  onDeepCutChange,
}) => {
  const [edgeInput, setEdgeInput] = React.useState("");

  const addEdge = () => {
    const trimmed = edgeInput.trim();
    if (!trimmed) return;
    if (!selectedEdges.includes(trimmed)) {
      onEdgesChange([...selectedEdges, trimmed]);
    }
    setEdgeInput("");
  };

  const removeEdge = (edge: string) => {
    onEdgesChange(selectedEdges.filter((e) => e !== edge));
  };

  return (
    <div className="mb-2 p-2 border border-gray-700 rounded">
      <Label className="flex items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        {set.name} ({set.points} pts)
      </Label>
      <div className="text-xs text-gray-400">{set.description}</div>

      {isSelected && (
        <div className="mt-2 font-sans space-y-2">
          {set.ability && (
            <div className="text-sm text-white">
              <span className="font-semibold">Ability:</span> {set.ability}
            </div>
          )}

          {set.skills && set.skills.length > 0 && (
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

          {set.feats && set.feats.length > 0 && (
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

          <div>
            <div className="text-sm text-white font-semibold mb-1">Edges</div>
            <div className="flex flex-wrap gap-1 mb-1">
              {selectedEdges.map((edge) => (
                <span key={edge} className="bg-gray-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                  {edge}
                  <button onClick={() => removeEdge(edge)} className="text-red-400">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-800 border border-gray-600 rounded p-1 text-sm"
                list="edge-options"
                value={edgeInput}
                onChange={(e) => setEdgeInput(e.target.value)}
              />
              <datalist id="edge-options">
                {edgeOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={addEdge}
                className="px-2 py-1 bg-accent text-black rounded text-xs"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-white font-semibold mb-1">Deep Cut Trigger</div>
            <textarea
              className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm"
              value={deepCutTrigger || ""}
              onChange={(e) => onDeepCutChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSetCard;

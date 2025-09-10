import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreat } from "@/context/ThreatContext";

export default function Step3_Traits() {
  const { threat, addTrait, removeTrait, addSkillSet, removeSkillSet, setCurrentStep } = useThreat();
  const [trait, setTrait] = useState("");
  const [skill, setSkill] = useState("");

  const addTraitHandler = () => {
    if (trait.trim()) {
      addTrait(trait.trim());
      setTrait("");
    }
  };

  const addSkillHandler = () => {
    if (skill.trim()) {
      addSkillSet(skill.trim());
      setSkill("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block mb-2">Traits</label>
        <div className="flex space-x-2 mb-2">
          <Input value={trait} onChange={(e) => setTrait(e.target.value)} />
          <Button type="button" onClick={addTraitHandler}>Add</Button>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {threat.traits.map((t, i) => (
            <li key={i} className="flex justify-between">
              <span>{t}</span>
              <Button variant="ghost" type="button" onClick={() => removeTrait(i)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label className="block mb-2">Skill Sets</label>
        <div className="flex space-x-2 mb-2">
          <Input value={skill} onChange={(e) => setSkill(e.target.value)} />
          <Button type="button" onClick={addSkillHandler}>Add</Button>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {threat.skillSets.map((s, i) => (
            <li key={i} className="flex justify-between">
              <span>{s}</span>
              <Button variant="ghost" type="button" onClick={() => removeSkillSet(i)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={() => setCurrentStep(2)}>Back</Button>
        <Button type="button" onClick={() => setCurrentStep(4)}>Next</Button>
      </div>
    </div>
  );
}

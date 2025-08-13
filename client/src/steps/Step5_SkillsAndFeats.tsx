import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkillSetCard from "@/components/SkillSetCard";
import FeatCard from "@/components/FeatCard";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { useCharacter } from "@/context/CharacterContext";
import { meetsPrerequisites, getMissingPrereqs } from "@/utils/requirementValidator";

const Step5_SkillsAndFeats = () => {
  const {
    selectedSkillSets,
    setSelectedSkillSets,
    selectedFeats,
    setSelectedFeats,
    abilityScores
  } = useCharacterBuilder();
  const { character, setCurrentStep, updateCharacterField } = useCharacter();

  const originName = character.origin?.split("(")[0].trim();
  const maxChoices = originName === "Highly Trained" ? 4 : 3;

  const { data: skillSets } = useCachedGameContent<any>("skill-sets");
  const { data: feats } = useCachedGameContent<any>("feats");

  const [workingSkillSets, setWorkingSkillSets] = useState<{ name: string; edges: string[]; deepCutNotes?: string }[]>(selectedSkillSets || []);
  const [workingFeats, setWorkingFeats] = useState<{ name: string }[]>(selectedFeats || []);

  const totalSelected = workingSkillSets.length + workingFeats.length;

  const characterData = {
    abilityScores,
    selectedSkills: [],
    startingSkills: [],
    selectedSkillSets: workingSkillSets,
    skillSets,
    selectedFeats: workingFeats,
  };

  const toggleSkillSet = (setObj: any) => {
    const exists = workingSkillSets.some((s) => s.name === setObj.name);
    if (exists) {
      setWorkingSkillSets((prev) => prev.filter((s) => s.name !== setObj.name));
    } else if (totalSelected < maxChoices) {
      setWorkingSkillSets((prev) => [...prev, { name: setObj.name, edges: [], deepCutNotes: "" }]);
    }
  };

  const toggleFeat = (feat: any, checked: boolean) => {
    const exists = workingFeats.some((f) => f.name === feat.name);
    if (checked) {
      if (!exists && totalSelected < maxChoices) {
        setWorkingFeats((prev) => [...prev, { name: feat.name }]);
      }
    } else {
      setWorkingFeats((prev) => prev.filter((f) => f.name !== feat.name));
    }
  };

  const handleEdgeToggle = (setName: string, edge: string) => {
    setWorkingSkillSets((prev) =>
      prev.map((s) => {
        if (s.name !== setName) return s;
        const has = s.edges.includes(edge);
        return { ...s, edges: has ? s.edges.filter((e) => e !== edge) : [...s.edges, edge] };
      })
    );
  };

  const handleDeepCutNotesChange = (setName: string, notes: string) => {
    setWorkingSkillSets((prev) =>
      prev.map((s) => (s.name === setName ? { ...s, deepCutNotes: notes } : s))
    );
  };

  const handlePrevious = () => setCurrentStep(4);

  const handleContinue = () => {
    setSelectedSkillSets(workingSkillSets);
    setSelectedFeats(workingFeats);

    // Update character with selected feats
    updateCharacterField('feats', workingFeats as any);

    setCurrentStep(6);
  };

  const canContinue =
    workingSkillSets.length >= 1 &&
    workingFeats.length >= 1 &&
    totalSelected === maxChoices;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Step 5: Skills & Feats</h2>
      <p className="mb-4 text-sm text-gray-300">
        Select {maxChoices} total skill sets and feats. You must choose at least one skill set and one feat.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Skill Sets</h3>
          {skillSets.map((set) => {
            const isSelected = workingSkillSets.some((s) => s.name === set.name);
            const selected = workingSkillSets.find((s) => s.name === set.name);
            return (
              <SkillSetCard
                key={set.name}
                set={set}
                isSelected={isSelected}
                disabled={totalSelected >= maxChoices && !isSelected}
                onToggle={() => toggleSkillSet(set)}
                selectedEdges={selected?.edges || []}
                onEdgeToggle={(edge) => handleEdgeToggle(set.name, edge)}
                deepCutNotes={selected?.deepCutNotes || ""}
                onDeepCutNotesChange={(v) => handleDeepCutNotesChange(set.name, v)}
              />
            );
          })}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Feats</h3>
          {feats.map((feat) => {
            const isSelected = workingFeats.some((f) => f.name === feat.name);
            const featDisabled =
              (!isSelected && totalSelected >= maxChoices) ||
              !meetsPrerequisites(feat, characterData);
            const missing = getMissingPrereqs(feat, characterData);
            return (
              <FeatCard
                key={feat.name}
                feat={feat}
                isSelected={isSelected}
                isDisabled={featDisabled}
                missingPrereqs={missing}
                onToggle={(checked) => toggleFeat(feat, checked)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <Button onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue}>
          Next <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Step5_SkillsAndFeats;

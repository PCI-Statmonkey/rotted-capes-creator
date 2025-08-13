import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { useCharacter } from "@/context/CharacterContext";
import skillSetOptions from "@/data/skillSets";

const Step5_SkillsAndFeats = () => {
  const { setSelectedSkillSets, setSelectedFeats } = useCharacterBuilder();
  const { character, setCurrentStep, updateCharacterField } = useCharacter();

  const originName = character.origin?.split("(")[0].trim();
  const isSkillBased = originName === "Highly Trained";

  const { data: feats = [] } = useCachedGameContent<any>("feats");

  const [row1SkillSet, setRow1SkillSet] = useState<string>("");
  const [row1CustomSkill, setRow1CustomSkill] = useState<string>("");
  const [row1Feat, setRow1Feat] = useState<string>("");

  const [row2SkillSet, setRow2SkillSet] = useState<string>("");
  const [row2CustomSkill, setRow2CustomSkill] = useState<string>("");
  const [row2Feat, setRow2Feat] = useState<string>("");

  const [row3SkillSet, setRow3SkillSet] = useState<string>("");
  const [row3CustomSkill, setRow3CustomSkill] = useState<string>("");
  const [row3Feat, setRow3Feat] = useState<string>("");

  const handlePrevious = () => setCurrentStep(4);

  const firstSkillValid = row1SkillSet === "custom" ? row1CustomSkill.trim() !== "" : row1SkillSet !== "";
  const row2Valid = row2SkillSet
    ? row2SkillSet === "custom"
      ? row2CustomSkill.trim() !== ""
      : true
    : row2Feat !== "";
  const row3Valid = !isSkillBased
    ? true
    : row3SkillSet
    ? row3SkillSet === "custom"
      ? row3CustomSkill.trim() !== ""
      : true
    : row3Feat !== "";

  const canContinue = firstSkillValid && row1Feat !== "" && row2Valid && row3Valid;

  const pushSkill = (val: string, custom: string, arr: { name: string; edges: string[] }[]) => {
    if (!val) return;
    const name = val === "custom" ? custom : val;
    arr.push({ name, edges: [] });
  };

  const handleContinue = () => {
    const skills: { name: string; edges: string[] }[] = [];
    const featsSelected: { name: string }[] = [];
    pushSkill(row1SkillSet, row1CustomSkill, skills);
    pushSkill(row2SkillSet, row2CustomSkill, skills);
    if (isSkillBased) pushSkill(row3SkillSet, row3CustomSkill, skills);

    if (row1Feat) featsSelected.push({ name: row1Feat });
    if (row2Feat) featsSelected.push({ name: row2Feat });
    if (isSkillBased && row3Feat) featsSelected.push({ name: row3Feat });

    setSelectedSkillSets(skills);
    setSelectedFeats(featsSelected);
    updateCharacterField('feats', featsSelected as any);
    setCurrentStep(6);
  };

  const renderSkillSelect = (
    value: string,
    setValue: (v: string) => void,
    customValue: string,
    setCustom: (v: string) => void,
    disabled = false
  ) => (
    <div>
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          if (v !== "custom") setCustom("");
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select skill set" />
        </SelectTrigger>
        <SelectContent>
          {skillSetOptions.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>
      {value === "custom" && (
        <Input
          className="mt-2"
          placeholder="Enter skill set"
          value={customValue}
          onChange={(e) => setCustom(e.target.value)}
        />
      )}
    </div>
  );

  const renderFeatSelect = (
    value: string,
    setValue: (v: string) => void,
    disabled = false
  ) => (
    <Select value={value} onValueChange={setValue} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select feat" />
      </SelectTrigger>
      <SelectContent>
        {feats.map((f: any) => (
          <SelectItem key={f.name} value={f.name}>
            {f.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

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
        Pick skill sets and feats for your hero. The first row requires one of each;
        the following rows let you choose either a skill set or a feat.
      </p>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {renderSkillSelect(row1SkillSet, setRow1SkillSet, row1CustomSkill, setRow1CustomSkill)}
          {renderFeatSelect(row1Feat, setRow1Feat)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {renderSkillSelect(
            row2SkillSet,
            (v) => {
              setRow2SkillSet(v);
              if (v) setRow2Feat("");
            },
            row2CustomSkill,
            setRow2CustomSkill,
            !!row2Feat
          )}
          {renderFeatSelect(row2Feat, (v) => {
            setRow2Feat(v);
            if (v) {
              setRow2SkillSet("");
              setRow2CustomSkill("");
            }
          }, !!row2SkillSet)}
        </div>
        {isSkillBased && (
          <div className="grid md:grid-cols-2 gap-4">
            {renderSkillSelect(
              row3SkillSet,
              (v) => {
                setRow3SkillSet(v);
                if (v) setRow3Feat("");
              },
              row3CustomSkill,
              setRow3CustomSkill,
              !!row3Feat
            )}
            {renderFeatSelect(row3Feat, (v) => {
              setRow3Feat(v);
              if (v) {
                setRow3SkillSet("");
                setRow3CustomSkill("");
              }
            }, !!row3SkillSet)}
          </div>
        )}
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

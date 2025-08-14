import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { useCharacter } from "@/context/CharacterContext";
import skillSetOptions from "@/data/skillSets";
import { displayFeatName } from "@/lib/utils";
import { getMissingPrereqs, formatPrerequisite } from "@/utils/requirementValidator";
import maneuversData from "@/rules/maneuvers.json";

const Step5_SkillsAndFeats = () => {
  const { setSelectedSkillSets, setSelectedFeats, setSelectedManeuvers } = useCharacterBuilder();
  const { character, setCurrentStep, updateCharacterField } = useCharacter();

  const originName = character.origin?.split("(")[0].trim();
  const isSkillBased = originName === "Highly Trained";

  const { data: featsData = [] } = useCachedGameContent<any>("feats");
  const { data: maneuvers = [] } = useCachedGameContent<any>("maneuvers");

  // Use static maneuvers data as a fallback in case the API does not return any.
  const allManeuvers = maneuvers.length > 0 ? maneuvers : maneuversData;

  const [row1SkillSet, setRow1SkillSet] = useState<string>("");
  const [row1CustomSkill, setRow1CustomSkill] = useState<string>("");
  const [row1Feat, setRow1Feat] = useState<string>("");

  const [row2SkillSet, setRow2SkillSet] = useState<string>("");
  const [row2CustomSkill, setRow2CustomSkill] = useState<string>("");
  const [row2Feat, setRow2Feat] = useState<string>("");

  const [row3SkillSet, setRow3SkillSet] = useState<string>("");
  const [row3CustomSkill, setRow3CustomSkill] = useState<string>("");
  const [row3Feat, setRow3Feat] = useState<string>("");
  const [row1Maneuver, setRow1Maneuver] = useState<string>("");
  const [row2Maneuver, setRow2Maneuver] = useState<string>("");
  const [row3Maneuver, setRow3Maneuver] = useState<string>("");

  const maneuversSet = useMemo(
    () => new Set(allManeuvers.map((m: any) => m.name)),
    [allManeuvers]
  );
  const feats = useMemo(() => {
    const unique = Array.from(
      new Map(featsData.map((f: any) => [f.name, f])).values()
    );
    return unique.filter((f: any) => !maneuversSet.has(f.name));
  }, [featsData, maneuversSet]);

  const prereqCharacter = useMemo(
    () => ({
      abilityScores: Object.fromEntries(
        Object.entries(character.abilities).map(([k, v]) => [k, (v as any).value])
      ),
      selectedFeats: character.feats,
    }),
    [character.abilities, character.feats]
  );

  const handlePrevious = () => setCurrentStep(4);

  const firstSkillValid = row1SkillSet === "custom" ? row1CustomSkill.trim() !== "" : row1SkillSet !== "";
  const row1FeatValid =
    row1Feat !== "" &&
    (row1Feat !== "Learn Combat Maneuver" || row1Maneuver !== "");
  const row2Valid = row2SkillSet
    ? row2SkillSet === "custom"
      ? row2CustomSkill.trim() !== ""
      : true
    : row2Feat !== "" &&
      (row2Feat !== "Learn Combat Maneuver" || row2Maneuver !== "");
  const row3Valid = !isSkillBased
    ? true
    : row3SkillSet
    ? row3SkillSet === "custom"
      ? row3CustomSkill.trim() !== ""
      : true
    : row3Feat !== "" &&
      (row3Feat !== "Learn Combat Maneuver" || row3Maneuver !== "");

  const canContinue = firstSkillValid && row1FeatValid && row2Valid && row3Valid;

  const pushSkill = (val: string, custom: string, arr: { name: string; edges: string[] }[]) => {
    if (!val) return;
    const name = val === "custom" ? custom : val;
    arr.push({ name, edges: [] });
  };

  const handleContinue = () => {
    const skills: { name: string; edges: string[] }[] = [];
    const featsSelected: { name: string }[] = [];
    const maneuversSelected: { name: string }[] = [];
    pushSkill(row1SkillSet, row1CustomSkill, skills);
    pushSkill(row2SkillSet, row2CustomSkill, skills);
    if (isSkillBased) pushSkill(row3SkillSet, row3CustomSkill, skills);

    if (row1Feat) {
      featsSelected.push({ name: row1Feat });
      if (row1Feat === "Learn Combat Maneuver" && row1Maneuver)
        maneuversSelected.push({ name: row1Maneuver });
    }
    if (row2Feat) {
      featsSelected.push({ name: row2Feat });
      if (row2Feat === "Learn Combat Maneuver" && row2Maneuver)
        maneuversSelected.push({ name: row2Maneuver });
    }
    if (isSkillBased && row3Feat) {
      featsSelected.push({ name: row3Feat });
      if (row3Feat === "Learn Combat Maneuver" && row3Maneuver)
        maneuversSelected.push({ name: row3Maneuver });
    }

    setSelectedSkillSets(skills);
    setSelectedFeats(featsSelected);
    setSelectedManeuvers(maneuversSelected.map((m) => m.name));
    updateCharacterField('feats', featsSelected as any);
    updateCharacterField('maneuvers', maneuversSelected as any);
    setCurrentStep(6);
  };

  const renderSkillSelect = (
    value: string,
    setValue: (v: string) => void,
    customValue: string,
    setCustom: (v: string) => void,
    disabled = false,
    includeNone = false
  ) => (
    <div>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v === "none") {
            setValue("");
            setCustom("");
          } else {
            setValue(v);
            if (v !== "custom") setCustom("");
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select skill set" />
        </SelectTrigger>
        <SelectContent>
          {includeNone && <SelectItem value="none">None</SelectItem>}
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
    disabled = false,
    includeNone = false
  ) => (
    <Select
      value={value}
      onValueChange={(v) => setValue(v === "none" ? "" : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select feat" />
      </SelectTrigger>
      <SelectContent>
        {includeNone && <SelectItem value="none">None</SelectItem>}
        {feats.map((f: any) => {
          const missing = getMissingPrereqs(f, prereqCharacter);
          const disabled = missing.length > 0;
          const title = disabled
            ? `Requires ${missing.map((m: any) => formatPrerequisite(m)).join(", ")}`
            : undefined;
          return (
            <SelectItem
              key={f.name}
              value={f.name}
              disabled={disabled}
              title={title}
            >
              {displayFeatName(f.name)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const renderManeuverSelect = (
    value: string,
    setValue: (v: string) => void
  ) => (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="Select maneuver" />
      </SelectTrigger>
      <SelectContent>
        {allManeuvers.map((m: any) => (
          <SelectItem key={m.name} value={m.name}>
            {m.name}
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
          <div>
            {renderFeatSelect(row1Feat, (v) => {
              setRow1Feat(v);
              setRow1Maneuver("");
            })}
            {row1Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row1Maneuver, setRow1Maneuver)}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {renderSkillSelect(
            row2SkillSet,
            (v) => {
              setRow2SkillSet(v);
              if (v) {
                setRow2Feat("");
                setRow2Maneuver("");
              }
            },
            row2CustomSkill,
            setRow2CustomSkill,
            !!row2Feat,
            true
          )}
          <div>
            {renderFeatSelect(
              row2Feat,
              (v) => {
                setRow2Feat(v);
                setRow2Maneuver("");
                if (v) {
                  setRow2SkillSet("");
                  setRow2CustomSkill("");
                }
              },
              !!row2SkillSet,
              true
            )}
            {row2Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row2Maneuver, setRow2Maneuver)}
          </div>
        </div>
        {isSkillBased && (
          <div className="grid md:grid-cols-2 gap-4">
            {renderSkillSelect(
              row3SkillSet,
              (v) => {
                setRow3SkillSet(v);
                if (v) {
                  setRow3Feat("");
                  setRow3Maneuver("");
                }
              },
              row3CustomSkill,
              setRow3CustomSkill,
              !!row3Feat,
              true
            )}
            <div>
              {renderFeatSelect(
                row3Feat,
                (v) => {
                  setRow3Feat(v);
                  setRow3Maneuver("");
                  if (v) {
                    setRow3SkillSet("");
                    setRow3CustomSkill("");
                  }
                },
                !!row3SkillSet,
                true
              )}
              {row3Feat === "Learn Combat Maneuver" &&
                renderManeuverSelect(row3Maneuver, setRow3Maneuver)}
            </div>
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

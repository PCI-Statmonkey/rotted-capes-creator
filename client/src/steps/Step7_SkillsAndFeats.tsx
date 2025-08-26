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
import featsFallback from "@/rules/feats.json";

const Step7_SkillsAndFeats = () => {
  const { setSelectedSkillSets, setSelectedFeats, setSelectedManeuvers } =
    useCharacterBuilder();
  const {
    character,
    setCurrentStep,
    updateCharacterField,
    updateAbilityScore,
  } = useCharacter();

  const originName = character.origin?.split("(")[0].trim();
  const isSkillBased = originName === "Highly Trained";

  const { data: featsData = [] } = useCachedGameContent<any>("feats");
  const { data: maneuvers = [] } = useCachedGameContent<any>("maneuvers");

  // Use static maneuvers data as a fallback in case the API does not return any.
  const allManeuvers = maneuvers.length > 0 ? maneuvers : maneuversData;
  const abilityOptions = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];

  const [row1SkillSet, setRow1SkillSet] = useState<string>("");
  const [row1CustomSkill, setRow1CustomSkill] = useState<string>("");
  const [row1Feat, setRow1Feat] = useState<string>("");

  const [row2SkillSet, setRow2SkillSet] = useState<string>("");
  const [row2CustomSkill, setRow2CustomSkill] = useState<string>("");
  const [row2Feat, setRow2Feat] = useState<string>("");

  const [row3SkillSet, setRow3SkillSet] = useState<string>("");
  const [row3CustomSkill, setRow3CustomSkill] = useState<string>("");
  const [row3Feat, setRow3Feat] = useState<string>("");
  const [row1Ability1, setRow1Ability1] = useState<string>("");
  const [row1Ability2, setRow1Ability2] = useState<string>("");
  const [row2Ability1, setRow2Ability1] = useState<string>("");
  const [row2Ability2, setRow2Ability2] = useState<string>("");
  const [row3Ability1, setRow3Ability1] = useState<string>("");
  const [row3Ability2, setRow3Ability2] = useState<string>("");
  const [row1Power1, setRow1Power1] = useState<string>("");
  const [row1Power2, setRow1Power2] = useState<string>("");
  const [row2Power1, setRow2Power1] = useState<string>("");
  const [row2Power2, setRow2Power2] = useState<string>("");
  const [row3Power1, setRow3Power1] = useState<string>("");
  const [row3Power2, setRow3Power2] = useState<string>("");
  const [row1Maneuver, setRow1Maneuver] = useState<string>("");
  const [row2Maneuver, setRow2Maneuver] = useState<string>("");
  const [row3Maneuver, setRow3Maneuver] = useState<string>("");

  const maneuversSet = useMemo(() => {
    return new Set(allManeuvers.map((m: any) => m.name));
  }, [allManeuvers]);

  const feats = useMemo(() => {
    const combined = [...featsFallback, ...featsData];
    const unique = Array.from(
      new Map(combined.map((f: any) => [f.name, f])).values()
    );
    return unique.filter((f: any) => {
      const baseName = f.name.replace(/\s*\(.*\)\s*$/, "");
      return !maneuversSet.has(baseName);
    });
  }, [featsData, maneuversSet]);

  const prereqCharacter = useMemo(
    () => ({
      abilityScores: Object.fromEntries(
        Object.entries(character.abilities).map(([k, v]) => [k, (v as any).value])
      ),
      selectedFeats: character.feats,
      complications: character.complications,
    }),
    [character.abilities, character.feats, character.complications]
  );

  const handlePrevious = () => setCurrentStep(6);

  const getManeuver = (name: string) =>
    allManeuvers.find((m: any) => m.name === name);

  const maneuverMeetsReqs = (name: string) => {
    const maneuver = getManeuver(name);
    if (!maneuver) return false;
    const missing = getMissingPrereqs(
      { prerequisites: maneuver.requirements || [] },
      prereqCharacter
    );
    return missing.hard.length === 0;
  };

  const firstSkillValid =
    row1SkillSet === "custom" ? row1CustomSkill.trim() !== "" : row1SkillSet !== "";
  const abilityIncreaseValid = (a1: string, a2: string) =>
    a1 !== "" && a2 !== "" && a1 !== a2;
  const powerIncreaseValid = (p1: string) => p1 !== "";
  const row1FeatValid =
    row1Feat !== "" &&
    (row1Feat === "Learn Combat Maneuver"
      ? row1Maneuver !== "" && maneuverMeetsReqs(row1Maneuver)
      : row1Feat === "Ability Score Increase"
      ? abilityIncreaseValid(row1Ability1, row1Ability2)
      : row1Feat.startsWith("Power Score Increase")
      ? powerIncreaseValid(row1Power1)
      : true);
  const row2Valid = row2SkillSet
    ? row2SkillSet === "custom"
      ? row2CustomSkill.trim() !== ""
      : true
    : row2Feat !== "" &&
      (row2Feat === "Learn Combat Maneuver"
        ? row2Maneuver !== "" && maneuverMeetsReqs(row2Maneuver)
        : row2Feat === "Ability Score Increase"
        ? abilityIncreaseValid(row2Ability1, row2Ability2)
        : row2Feat.startsWith("Power Score Increase")
        ? powerIncreaseValid(row2Power1)
        : true);
  const row3Valid = !isSkillBased
    ? true
    : row3SkillSet
    ? row3SkillSet === "custom"
      ? row3CustomSkill.trim() !== ""
      : true
    : row3Feat !== "" &&
      (row3Feat === "Learn Combat Maneuver"
        ? row3Maneuver !== "" && maneuverMeetsReqs(row3Maneuver)
        : row3Feat === "Ability Score Increase"
        ? abilityIncreaseValid(row3Ability1, row3Ability2)
        : row3Feat.startsWith("Power Score Increase")
        ? powerIncreaseValid(row3Power1)
        : true);

  const canContinue = firstSkillValid && row1FeatValid && row2Valid && row3Valid;

  const pushSkill = (val: string, custom: string, arr: { name: string; edges: string[] }[]) => {
    if (!val) return;
    const name = val === "custom" ? custom : val;
    arr.push({ name, edges: [] });
  };

  const handleContinue = () => {
    const skills: { name: string; edges: string[] }[] = [];
    const featsSelected: {
      name: string;
      abilityChoices?: string[];
      powerChoices?: string[];
    }[] = [];
    const maneuversSelected: { name: string }[] = [];
    pushSkill(row1SkillSet, row1CustomSkill, skills);
    pushSkill(row2SkillSet, row2CustomSkill, skills);
    if (isSkillBased) pushSkill(row3SkillSet, row3CustomSkill, skills);

    if (row1Feat) {
      const feat: {
        name: string;
        abilityChoices?: string[];
        powerChoices?: string[];
      } = {
        name: row1Feat,
      };
      if (
        row1Feat === "Ability Score Increase" &&
        abilityIncreaseValid(row1Ability1, row1Ability2)
      ) {
        feat.abilityChoices = [row1Ability1, row1Ability2];
      }
      if (
        row1Feat.startsWith("Power Score Increase") &&
        powerIncreaseValid(row1Power1)
      ) {
        feat.powerChoices = [row1Power1, row1Power2 || row1Power1];
      }
      featsSelected.push(feat);
      if (row1Feat === "Learn Combat Maneuver" && row1Maneuver)
        maneuversSelected.push({ name: row1Maneuver });
    }
    if (row2Feat) {
      const feat: {
        name: string;
        abilityChoices?: string[];
        powerChoices?: string[];
      } = {
        name: row2Feat,
      };
      if (
        row2Feat === "Ability Score Increase" &&
        abilityIncreaseValid(row2Ability1, row2Ability2)
      ) {
        feat.abilityChoices = [row2Ability1, row2Ability2];
      }
      if (
        row2Feat.startsWith("Power Score Increase") &&
        powerIncreaseValid(row2Power1)
      ) {
        feat.powerChoices = [row2Power1, row2Power2 || row2Power1];
      }
      featsSelected.push(feat);
      if (row2Feat === "Learn Combat Maneuver" && row2Maneuver)
        maneuversSelected.push({ name: row2Maneuver });
    }
    if (isSkillBased && row3Feat) {
      const feat: {
        name: string;
        abilityChoices?: string[];
        powerChoices?: string[];
      } = {
        name: row3Feat,
      };
      if (
        row3Feat === "Ability Score Increase" &&
        abilityIncreaseValid(row3Ability1, row3Ability2)
      ) {
        feat.abilityChoices = [row3Ability1, row3Ability2];
      }
      if (
        row3Feat.startsWith("Power Score Increase") &&
        powerIncreaseValid(row3Power1)
      ) {
        feat.powerChoices = [row3Power1, row3Power2 || row3Power1];
      }
      featsSelected.push(feat);
      if (row3Feat === "Learn Combat Maneuver" && row3Maneuver)
        maneuversSelected.push({ name: row3Maneuver });
    }

    // Remove previous ability and power score increases
    const abilities = { ...character.abilities } as Record<string, any>;
    const powers = character.powers.map((p) => ({ ...p }));
    character.feats.forEach((f: any) => {
      if (f.name === "Ability Score Increase" && f.abilityChoices) {
        f.abilityChoices.forEach((ab: string) => {
          abilities[ab].value -= 1;
        });
      }
      if (f.name.startsWith("Power Score Increase") && f.powerChoices) {
        f.powerChoices.forEach((pc: string) => {
          const power = powers.find((p) => p.name === pc);
          if (power) {
            const score = power.finalScore ?? power.score ?? 10;
            power.finalScore = Math.max(0, score - 1);
          }
        });
      }
    });

    // Apply new ability and power score increases
    featsSelected.forEach((f) => {
      if (f.name === "Ability Score Increase" && f.abilityChoices) {
        f.abilityChoices.forEach((ab) => {
          abilities[ab].value += 1;
        });
      }
      if (f.name.startsWith("Power Score Increase") && f.powerChoices) {
        f.powerChoices.forEach((pc) => {
          const power = powers.find((p) => p.name === pc);
          if (power) {
            const score = power.finalScore ?? power.score ?? 10;
            power.finalScore = Math.min(25, score + 1);
          }
        });
      }
    });

    (Object.keys(abilities) as string[]).forEach((ab) => {
      updateAbilityScore(ab as any, abilities[ab].value);
    });
    updateCharacterField("powers", powers);

    setSelectedSkillSets(skills);
    setSelectedFeats(featsSelected as any);
    setSelectedManeuvers(maneuversSelected.map((m) => m.name));
    updateCharacterField("feats", featsSelected as any);
    updateCharacterField("maneuvers", maneuversSelected as any);
    setCurrentStep(8);
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
          const disabled = missing.hard.length > 0;
          const titleParts = [] as string[];
          if (missing.hard.length > 0)
            titleParts.push(
              `Requires ${missing.hard
                .map((m: any) => formatPrerequisite(m))
                .join(", ")}`
            );
          if (missing.soft.length > 0)
            titleParts.push(
              `Story: ${missing.soft
                .map((m: any) => formatPrerequisite(m))
                .join(", ")}`
            );
          const title = titleParts.length ? titleParts.join(" | ") : undefined;
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
        {allManeuvers.map((m: any) => {
          const missing = getMissingPrereqs(
            { prerequisites: m.requirements || [] },
            prereqCharacter
          );
          const disabled = missing.hard.length > 0;
          const titleParts: string[] = [];
          if (missing.hard.length > 0)
            titleParts.push(
              `Requires ${missing.hard
                .map((r: any) => formatPrerequisite(r))
                .join(", ")}`
            );
          if (missing.soft.length > 0)
            titleParts.push(
              `Story: ${missing.soft
                .map((r: any) => formatPrerequisite(r))
                .join(", ")}`
            );
          const title = titleParts.length ? titleParts.join(" | ") : undefined;
          return (
            <SelectItem
              key={m.name}
              value={m.name}
              disabled={disabled}
              title={title}
            >
              {m.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const renderAbilitySelects = (
    a1: string,
    setA1: (v: string) => void,
    a2: string,
    setA2: (v: string) => void
  ) => (
    <div className="mt-2 flex space-x-2">
      <Select value={a1} onValueChange={setA1}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ability 1" />
        </SelectTrigger>
        <SelectContent>
          {abilityOptions.map((ab) => (
            <SelectItem key={ab} value={ab} disabled={ab === a2}>
              {ab.charAt(0).toUpperCase() + ab.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={a2} onValueChange={setA2}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ability 2" />
        </SelectTrigger>
        <SelectContent>
          {abilityOptions.map((ab) => (
            <SelectItem key={ab} value={ab} disabled={ab === a1}>
              {ab.charAt(0).toUpperCase() + ab.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderPowerSelects = (
    p1: string,
    setP1: (v: string) => void,
    p2: string,
    setP2: (v: string) => void
  ) => (
    <div className="mt-2 flex space-x-2">
      <Select value={p1} onValueChange={(v) => setP1(v === "none" ? "" : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Power 1" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {character.powers.map((p) => (
            <SelectItem key={p.name} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={p2} onValueChange={(v) => setP2(v === "none" ? "" : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Power 2 (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {character.powers.map((p) => (
            <SelectItem key={p.name} value={p.name}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Step 7: Skills & Feats</h2>
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
              setRow1Ability1("");
              setRow1Ability2("");
              setRow1Power1("");
              setRow1Power2("");
            })}
            {row1Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row1Maneuver, setRow1Maneuver)}
            {row1Feat === "Ability Score Increase" &&
              renderAbilitySelects(
                row1Ability1,
                setRow1Ability1,
                row1Ability2,
                setRow1Ability2
              )}
            {row1Feat.startsWith("Power Score Increase") &&
              renderPowerSelects(
                row1Power1,
                setRow1Power1,
                row1Power2,
                setRow1Power2
              )}
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
                setRow2Ability1("");
                setRow2Ability2("");
                setRow2Power1("");
                setRow2Power2("");
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
                  setRow2Ability1("");
                  setRow2Ability2("");
                  setRow2Power1("");
                  setRow2Power2("");
                }
              },
              !!row2SkillSet,
              true
            )}
            {row2Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row2Maneuver, setRow2Maneuver)}
            {row2Feat === "Ability Score Increase" &&
              renderAbilitySelects(
                row2Ability1,
                setRow2Ability1,
                row2Ability2,
                setRow2Ability2
              )}
            {row2Feat.startsWith("Power Score Increase") &&
              renderPowerSelects(
                row2Power1,
                setRow2Power1,
                row2Power2,
                setRow2Power2
              )}
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
                  setRow3Ability1("");
                  setRow3Ability2("");
                  setRow3Power1("");
                  setRow3Power2("");
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
                    setRow3Ability1("");
                    setRow3Ability2("");
                    setRow3Power1("");
                    setRow3Power2("");
                  }
                },
                !!row3SkillSet,
                true
              )}
              {row3Feat === "Learn Combat Maneuver" &&
                renderManeuverSelect(row3Maneuver, setRow3Maneuver)}
              {row3Feat === "Ability Score Increase" &&
                renderAbilitySelects(
                  row3Ability1,
                  setRow3Ability1,
                  row3Ability2,
                  setRow3Ability2
                )}
              {row3Feat.startsWith("Power Score Increase") &&
                renderPowerSelects(
                  row3Power1,
                  setRow3Power1,
                  row3Power2,
                  setRow3Power2
                )}
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

export default Step7_SkillsAndFeats;

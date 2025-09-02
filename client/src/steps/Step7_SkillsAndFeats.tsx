import { useState, useMemo, useEffect } from "react";
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
import powersData from "@/rules/powers.json";

const Step7_SkillsAndFeats = () => {
  const {
    selectedSkillSets,
    selectedFeats,
    selectedManeuvers,
    setSelectedSkillSets,
    setSelectedFeats,
    setSelectedManeuvers,
  } = useCharacterBuilder();
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

  const POWER_TRICKS = useMemo(
    () =>
      (powersData as any[])
        .filter((p: any) => /power trick/i.test(p.name))
        .map((p: any) => ({ name: p.name, powers: p.tags || [] })),
    [powersData]
  );
  const characterPowerNames = useMemo(
    () => character.powers.map((p: any) => p.name),
    [character.powers]
  );
  const availablePowerTricks = useMemo(
    () =>
      POWER_TRICKS.filter(
        (t) =>
          t.powers.length === 0 ||
          t.powers.some((p: string) => characterPowerNames.includes(p))
      ).map((t) => t.name),
    [POWER_TRICKS, characterPowerNames]
  );

  const EMULATED_MAP = useMemo(() => {
    const map: Record<string, string[]> = {};
    (powersData as any[]).forEach((p: any) => {
      if (/power trick/i.test(p.name)) return;
      const desc = p.description || "";
      const match = desc.match(/Emulated Powers?:([^*]+)/i);
      if (match) {
        let text = match[1];
        const idx = text.toLowerCase().indexOf("power trick");
        if (idx >= 0) text = text.slice(0, idx);
        const names = text
          .split(/[,;]/)
          .map((s: string) => s.replace(/\*|\n/g, "").trim())
          .filter(Boolean);
        if (names.length) map[p.name] = names;
      }
    });
    return map;
  }, [powersData]);
  const emulatableParentPowers = useMemo(
    () => characterPowerNames.filter((n) => EMULATED_MAP[n]?.length),
    [characterPowerNames, EMULATED_MAP]
  );

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
  const [row1PowerTrick, setRow1PowerTrick] = useState<string>("");
  const [row1CustomPowerTrick, setRow1CustomPowerTrick] = useState<string>("");
  const [row2PowerTrick, setRow2PowerTrick] = useState<string>("");
  const [row2CustomPowerTrick, setRow2CustomPowerTrick] = useState<string>("");
  const [row3PowerTrick, setRow3PowerTrick] = useState<string>("");
  const [row3CustomPowerTrick, setRow3CustomPowerTrick] = useState<string>("");
  const [row1StuntType, setRow1StuntType] = useState<string>("");
  const [row2StuntType, setRow2StuntType] = useState<string>("");
  const [row3StuntType, setRow3StuntType] = useState<string>("");
  const [row1EmulatedParent, setRow1EmulatedParent] = useState<string>("");
  const [row1EmulatedPower, setRow1EmulatedPower] = useState<string>("");
  const [row2EmulatedParent, setRow2EmulatedParent] = useState<string>("");
  const [row2EmulatedPower, setRow2EmulatedPower] = useState<string>("");
  const [row3EmulatedParent, setRow3EmulatedParent] = useState<string>("");
  const [row3EmulatedPower, setRow3EmulatedPower] = useState<string>("");

  useEffect(() => {
    if (selectedSkillSets[0]) {
      const name = selectedSkillSets[0].name;
      if (skillSetOptions.includes(name)) {
        setRow1SkillSet(name);
      } else {
        setRow1SkillSet("custom");
        setRow1CustomSkill(name);
      }
    }
    if (selectedSkillSets[1]) {
      const name = selectedSkillSets[1].name;
      if (skillSetOptions.includes(name)) {
        setRow2SkillSet(name);
      } else {
        setRow2SkillSet("custom");
        setRow2CustomSkill(name);
      }
    }
    if (isSkillBased && selectedSkillSets[2]) {
      const name = selectedSkillSets[2].name;
      if (skillSetOptions.includes(name)) {
        setRow3SkillSet(name);
      } else {
        setRow3SkillSet("custom");
        setRow3CustomSkill(name);
      }
    }

    if (selectedFeats[0]) {
      setRow1Feat(selectedFeats[0].name);
      if (selectedFeats[0].abilityChoices) {
        setRow1Ability1(selectedFeats[0].abilityChoices[0] || "");
        setRow1Ability2(selectedFeats[0].abilityChoices[1] || "");
      }
      if (selectedFeats[0].powerChoices) {
        setRow1Power1(selectedFeats[0].powerChoices[0] || "");
        setRow1Power2(selectedFeats[0].powerChoices[1] || "");
      }
      if (selectedFeats[0].name === "Learn Power Stunt") {
        if (selectedFeats[0].emulatedPower) {
          setRow1StuntType("emulated");
          setRow1EmulatedParent(selectedFeats[0].emulatedPower.parent);
          setRow1EmulatedPower(selectedFeats[0].emulatedPower.name);
        } else if (selectedFeats[0].powerTrick) {
          setRow1StuntType("trick");
          const trick = selectedFeats[0].powerTrick;
          if (POWER_TRICKS.some((t) => t.name === trick)) {
            setRow1PowerTrick(trick);
          } else {
            setRow1PowerTrick("custom");
            setRow1CustomPowerTrick(trick);
          }
        }
      } else if (selectedFeats[0].powerTrick) {
        const trick = selectedFeats[0].powerTrick;
        if (POWER_TRICKS.some((t) => t.name === trick)) {
          setRow1PowerTrick(trick);
        } else {
          setRow1PowerTrick("custom");
          setRow1CustomPowerTrick(trick);
        }
      }
    }
    if (selectedFeats[1]) {
      setRow2Feat(selectedFeats[1].name);
      if (selectedFeats[1].abilityChoices) {
        setRow2Ability1(selectedFeats[1].abilityChoices[0] || "");
        setRow2Ability2(selectedFeats[1].abilityChoices[1] || "");
      }
      if (selectedFeats[1].powerChoices) {
        setRow2Power1(selectedFeats[1].powerChoices[0] || "");
        setRow2Power2(selectedFeats[1].powerChoices[1] || "");
      }
      if (selectedFeats[1].name === "Learn Power Stunt") {
        if (selectedFeats[1].emulatedPower) {
          setRow2StuntType("emulated");
          setRow2EmulatedParent(selectedFeats[1].emulatedPower.parent);
          setRow2EmulatedPower(selectedFeats[1].emulatedPower.name);
        } else if (selectedFeats[1].powerTrick) {
          setRow2StuntType("trick");
          const trick = selectedFeats[1].powerTrick;
          if (POWER_TRICKS.some((t) => t.name === trick)) {
            setRow2PowerTrick(trick);
          } else {
            setRow2PowerTrick("custom");
            setRow2CustomPowerTrick(trick);
          }
        }
      } else if (selectedFeats[1].powerTrick) {
        const trick = selectedFeats[1].powerTrick;
        if (POWER_TRICKS.some((t) => t.name === trick)) {
          setRow2PowerTrick(trick);
        } else {
          setRow2PowerTrick("custom");
          setRow2CustomPowerTrick(trick);
        }
      }
    }
    if (isSkillBased && selectedFeats[2]) {
      setRow3Feat(selectedFeats[2].name);
      if (selectedFeats[2].abilityChoices) {
        setRow3Ability1(selectedFeats[2].abilityChoices[0] || "");
        setRow3Ability2(selectedFeats[2].abilityChoices[1] || "");
      }
      if (selectedFeats[2].powerChoices) {
        setRow3Power1(selectedFeats[2].powerChoices[0] || "");
        setRow3Power2(selectedFeats[2].powerChoices[1] || "");
      }
      if (selectedFeats[2].name === "Learn Power Stunt") {
        if (selectedFeats[2].emulatedPower) {
          setRow3StuntType("emulated");
          setRow3EmulatedParent(selectedFeats[2].emulatedPower.parent);
          setRow3EmulatedPower(selectedFeats[2].emulatedPower.name);
        } else if (selectedFeats[2].powerTrick) {
          setRow3StuntType("trick");
          const trick = selectedFeats[2].powerTrick;
          if (POWER_TRICKS.some((t) => t.name === trick)) {
            setRow3PowerTrick(trick);
          } else {
            setRow3PowerTrick("custom");
            setRow3CustomPowerTrick(trick);
          }
        }
      } else if (selectedFeats[2].powerTrick) {
        const trick = selectedFeats[2].powerTrick;
        if (POWER_TRICKS.some((t) => t.name === trick)) {
          setRow3PowerTrick(trick);
        } else {
          setRow3PowerTrick("custom");
          setRow3CustomPowerTrick(trick);
        }
      }
    }
    if (selectedFeats[0]?.name === "Learn Combat Maneuver" && selectedManeuvers[0]) {
      setRow1Maneuver(selectedManeuvers[0]);
    }
    if (selectedFeats[1]?.name === "Learn Combat Maneuver" && selectedManeuvers[1]) {
      setRow2Maneuver(selectedManeuvers[1]);
    }
    if (isSkillBased && selectedFeats[2]?.name === "Learn Combat Maneuver" && selectedManeuvers[2]) {
      setRow3Maneuver(selectedManeuvers[2]);
    }
  }, [isSkillBased, selectedSkillSets, selectedFeats, selectedManeuvers]);

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
      : row1Feat === "Learn Power Stunt"
      ? row1StuntType === "trick"
        ? row1PowerTrick !== "" &&
          (row1PowerTrick !== "custom" || row1CustomPowerTrick.trim() !== "")
        : row1StuntType === "emulated"
        ? row1EmulatedParent !== "" && row1EmulatedPower !== ""
        : false
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
        : row2Feat === "Learn Power Stunt"
        ? row2StuntType === "trick"
          ? row2PowerTrick !== "" &&
            (row2PowerTrick !== "custom" || row2CustomPowerTrick.trim() !== "")
          : row2StuntType === "emulated"
          ? row2EmulatedParent !== "" && row2EmulatedPower !== ""
          : false
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
        : row3Feat === "Learn Power Stunt"
        ? row3StuntType === "trick"
          ? row3PowerTrick !== "" &&
            (row3PowerTrick !== "custom" || row3CustomPowerTrick.trim() !== "")
          : row3StuntType === "emulated"
          ? row3EmulatedParent !== "" && row3EmulatedPower !== ""
          : false
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
      powerTrick?: string;
      emulatedPower?: { parent: string; name: string };
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
        powerTrick?: string;
        emulatedPower?: { parent: string; name: string };
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
      if (row1Feat === "Learn Power Stunt") {
        if (row1StuntType === "trick") {
          feat.powerTrick =
            row1PowerTrick === "custom" ? row1CustomPowerTrick : row1PowerTrick;
        } else if (row1StuntType === "emulated") {
          feat.emulatedPower = {
            parent: row1EmulatedParent,
            name: row1EmulatedPower,
          };
        }
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
        powerTrick?: string;
        emulatedPower?: { parent: string; name: string };
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
      if (row2Feat === "Learn Power Stunt") {
        if (row2StuntType === "trick") {
          feat.powerTrick =
            row2PowerTrick === "custom" ? row2CustomPowerTrick : row2PowerTrick;
        } else if (row2StuntType === "emulated") {
          feat.emulatedPower = {
            parent: row2EmulatedParent,
            name: row2EmulatedPower,
          };
        }
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
        powerTrick?: string;
        emulatedPower?: { parent: string; name: string };
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
      if (row3Feat === "Learn Power Stunt") {
        if (row3StuntType === "trick") {
          feat.powerTrick =
            row3PowerTrick === "custom" ? row3CustomPowerTrick : row3PowerTrick;
        } else if (row3StuntType === "emulated") {
          feat.emulatedPower = {
            parent: row3EmulatedParent,
            name: row3EmulatedPower,
          };
        }
      }
      featsSelected.push(feat);
      if (row3Feat === "Learn Combat Maneuver" && row3Maneuver)
        maneuversSelected.push({ name: row3Maneuver });
    }

    // Remove previous ability and power score increases
    const abilities = { ...character.abilities } as Record<string, any>;
    const powers = character.powers.map((p) => ({ ...p }));
    // Roll back previous Step 7 ability and power increases
    character.feats
      .filter((f: any) => !f.source)
      .forEach((f: any) => {
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
    // Preserve existing feats (such as those from archetypes or weaknesses)
    const mergedFeats = (character.feats as any[]).filter((f) => f.source);
    (featsSelected as any[]).forEach((f) => {
      if (!mergedFeats.some((existing) => existing.name === f.name)) {
        mergedFeats.push(f);
      }
    });
    updateCharacterField("feats", mergedFeats as any);
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
          const alreadyHas = character.feats.some(
            (cf: any) => cf.name === f.name && cf.source
          );
          const disabled = missing.hard.length > 0 || alreadyHas;
          const titleParts = [] as string[];
          if (alreadyHas) titleParts.push("Already have this feat");
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
              {alreadyHas && (
                <span className="text-xs text-gray-400 ml-1">(taken)</span>
              )}
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

  const renderPowerTrickSelect = (
    value: string,
    setValue: (v: string) => void,
    custom: string,
    setCustom: (v: string) => void,
    options: string[]
  ) => (
    <div className="mt-2">
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          if (v !== "custom") setCustom("");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select power trick" />
        </SelectTrigger>
        <SelectContent>
          {options.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>
      {value === "custom" && (
        <Input
          className="mt-2"
          placeholder="Enter power trick"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      )}
    </div>
  );

  const renderStuntTypeSelect = (
    value: string,
    setValue: (v: string) => void
  ) => (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="Select stunt type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="trick">Power Trick</SelectItem>
        <SelectItem value="emulated">Emulated Power</SelectItem>
      </SelectContent>
    </Select>
  );

  const renderEmulatedPowerSelect = (
    parent: string,
    setParent: (v: string) => void,
    power: string,
    setPower: (v: string) => void
  ) => (
    <div className="mt-2 space-y-2">
      <Select
        value={parent}
        onValueChange={(v) => {
          setParent(v);
          setPower("");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select power" />
        </SelectTrigger>
        <SelectContent>
          {emulatableParentPowers.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {parent && (
        <Select value={power} onValueChange={setPower}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select emulated power" />
          </SelectTrigger>
          <SelectContent>
            {EMULATED_MAP[parent].map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
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
      <h2 className="text-2xl font-display font-bold text-red-500 mb-4">Step 7: Skills & Feats</h2>
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
              setRow1PowerTrick("");
              setRow1CustomPowerTrick("");
              setRow1StuntType("");
              setRow1EmulatedParent("");
              setRow1EmulatedPower("");
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
            {row1Feat === "Learn Power Stunt" &&
              renderStuntTypeSelect(row1StuntType, (v) => {
                setRow1StuntType(v);
                setRow1PowerTrick("");
                setRow1CustomPowerTrick("");
                setRow1EmulatedParent("");
                setRow1EmulatedPower("");
              })}
            {row1Feat === "Learn Power Stunt" && row1StuntType === "trick" &&
              renderPowerTrickSelect(
                row1PowerTrick,
                setRow1PowerTrick,
                row1CustomPowerTrick,
                setRow1CustomPowerTrick,
                availablePowerTricks
              )}
            {row1Feat === "Learn Power Stunt" && row1StuntType === "emulated" &&
              renderEmulatedPowerSelect(
                row1EmulatedParent,
                setRow1EmulatedParent,
                row1EmulatedPower,
                setRow1EmulatedPower
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
                setRow2PowerTrick("");
                setRow2CustomPowerTrick("");
                setRow2StuntType("");
                setRow2EmulatedParent("");
                setRow2EmulatedPower("");
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
                  setRow2PowerTrick("");
                  setRow2CustomPowerTrick("");
                  setRow2StuntType("");
                  setRow2EmulatedParent("");
                  setRow2EmulatedPower("");
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
            {row2Feat === "Learn Power Stunt" &&
              renderStuntTypeSelect(row2StuntType, (v) => {
                setRow2StuntType(v);
                setRow2PowerTrick("");
                setRow2CustomPowerTrick("");
                setRow2EmulatedParent("");
                setRow2EmulatedPower("");
              })}
            {row2Feat === "Learn Power Stunt" && row2StuntType === "trick" &&
              renderPowerTrickSelect(
                row2PowerTrick,
                setRow2PowerTrick,
                row2CustomPowerTrick,
                setRow2CustomPowerTrick,
                availablePowerTricks
              )}
            {row2Feat === "Learn Power Stunt" && row2StuntType === "emulated" &&
              renderEmulatedPowerSelect(
                row2EmulatedParent,
                setRow2EmulatedParent,
                row2EmulatedPower,
                setRow2EmulatedPower
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
                  setRow3PowerTrick("");
                  setRow3CustomPowerTrick("");
                  setRow3StuntType("");
                  setRow3EmulatedParent("");
                  setRow3EmulatedPower("");
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
                    setRow3PowerTrick("");
                    setRow3CustomPowerTrick("");
                    setRow3StuntType("");
                    setRow3EmulatedParent("");
                    setRow3EmulatedPower("");
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
              {row3Feat === "Learn Power Stunt" &&
                renderStuntTypeSelect(row3StuntType, (v) => {
                  setRow3StuntType(v);
                  setRow3PowerTrick("");
                  setRow3CustomPowerTrick("");
                  setRow3EmulatedParent("");
                  setRow3EmulatedPower("");
                })}
              {row3Feat === "Learn Power Stunt" && row3StuntType === "trick" &&
                renderPowerTrickSelect(
                  row3PowerTrick,
                  setRow3PowerTrick,
                  row3CustomPowerTrick,
                  setRow3CustomPowerTrick,
                  availablePowerTricks
                )}
              {row3Feat === "Learn Power Stunt" && row3StuntType === "emulated" &&
                renderEmulatedPowerSelect(
                  row3EmulatedParent,
                  setRow3EmulatedParent,
                  row3EmulatedPower,
                  setRow3EmulatedPower
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

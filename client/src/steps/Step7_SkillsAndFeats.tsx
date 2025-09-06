import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import { useCharacter } from "@/context/CharacterContext";
import skillSetOptions from "@/data/skillSets";
import { displayFeatName } from "@/lib/utils";
import { getMissingPrereqs, formatPrerequisite } from "@/utils/requirementValidator";
import maneuversData from "@/rules/maneuvers.json";
import featsFallback from "@/rules/feats.json";
import powersData from "@/rules/powers.json";
import gearData from "@/rules/gear.json" with { type: "json" };

const DAMAGE_TYPES = [
  "Kinetic", "Fire", "Cold", "Electrical", "Acid", "Sonic",
  "Light", "Radiation", "Dark", "Force", "Psychic"
];

const MELEE_WEAPONS = (gearData as any[])
  .filter((g: any) => g.category === "meleeWeapons")
  .map((g: any) => g.name);

const Step7_SkillsAndFeats = () => {
  const {
    selectedSkillSets,
    selectedFeats,
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
  const leadershipManeuvers = useMemo(
    () =>
      allManeuvers.filter((m: any) =>
        (m.type || "").toLowerCase().includes("leadership")
      ),
    [allManeuvers]
  );
  const abilityOptions = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ];

  // Mappings for power tricks and emulated powers derived from rules data
  const powerTrickMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (powersData as any[]).forEach((p: any) => {
      if (/^Power Trick:/i.test(p.name)) {
        const match = p.description.match(/\*\*Power[s]?:\*\*\s*([^*]+)/i);
        if (match) {
          map[p.name] = match[1]
            .split(/,|\n/)
            .map((s: string) => s.trim())
            .filter(Boolean);
        } else {
          map[p.name] = [];
        }
      }
    });
    return map;
  }, []);

  const emulatedPowerMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (powersData as any[]).forEach((p: any) => {
      if (!/^Power Trick:/i.test(p.name)) {
        const match = p.description.match(/\*Emulated Powers:\*([^*]+)/i);
        if (match) {
          let listText = match[1];
          const end = listText.indexOf("*Power");
          if (end !== -1) listText = listText.slice(0, end);
          const list = listText
            .split(/,|\n/)
            .map((s: string) => s.replace(/\\\*.*$/, "").trim())
            .filter(Boolean);
          if (list.length) map[p.name] = list;
        }
      }
    });
    return map;
  }, []);

  const characterPowerNames = useMemo(
    () => character.powers.map((p) => p.name),
    [character.powers]
  );

  const availablePowerTricks = useMemo(
    () =>
      Object.entries(powerTrickMap)
        .filter(([_, reqs]) =>
          reqs.every((r) => characterPowerNames.includes(r))
        )
        .map(([name]) => name),
    [powerTrickMap, characterPowerNames]
  );

  const availableEmulatedParents = useMemo(
    () =>
      characterPowerNames.filter((p) =>
        Array.isArray(emulatedPowerMap[p]) && emulatedPowerMap[p].length > 0
      ),
    [characterPowerNames, emulatedPowerMap]
  );

  const availableNewPowers = useMemo(
    () =>
      (powersData as any[])
        .map((p: any) => p.name)
        .filter((n: string) => !characterPowerNames.includes(n)),
    [characterPowerNames]
  );

  const isPowerStuntFeat = (name: string) =>
    name === "Learn Power Stunt" || name === "Learn Power Trick";

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
  const [row1Leadership1, setRow1Leadership1] = useState<string>("");
  const [row1Leadership2, setRow1Leadership2] = useState<string>("");
  const [row2Leadership1, setRow2Leadership1] = useState<string>("");
  const [row2Leadership2, setRow2Leadership2] = useState<string>("");
  const [row3Leadership1, setRow3Leadership1] = useState<string>("");
  const [row3Leadership2, setRow3Leadership2] = useState<string>("");
  const [row1PowerTrick, setRow1PowerTrick] = useState<string>("");
  const [row1CustomPowerTrick, setRow1CustomPowerTrick] = useState<string>("");
  const [row2PowerTrick, setRow2PowerTrick] = useState<string>("");
  const [row2CustomPowerTrick, setRow2CustomPowerTrick] = useState<string>("");
  const [row3PowerTrick, setRow3PowerTrick] = useState<string>("");
  const [row3CustomPowerTrick, setRow3CustomPowerTrick] = useState<string>("");
  const [row1StuntType, setRow1StuntType] = useState<string>("");
  const [row1EmulatedParent, setRow1EmulatedParent] = useState<string>("");
  const [row1EmulatedPower, setRow1EmulatedPower] = useState<string>("");
  const [row2StuntType, setRow2StuntType] = useState<string>("");
  const [row2EmulatedParent, setRow2EmulatedParent] = useState<string>("");
  const [row2EmulatedPower, setRow2EmulatedPower] = useState<string>("");
  const [row3StuntType, setRow3StuntType] = useState<string>("");
  const [row3EmulatedParent, setRow3EmulatedParent] = useState<string>("");
  const [row3EmulatedPower, setRow3EmulatedPower] = useState<string>("");
  const [row1NewPower, setRow1NewPower] = useState<string>("");
  const [row2NewPower, setRow2NewPower] = useState<string>("");
  const [row3NewPower, setRow3NewPower] = useState<string>("");
  const [row1CustomEmulatedPower, setRow1CustomEmulatedPower] = useState<string>("");
  const [row2CustomEmulatedPower, setRow2CustomEmulatedPower] = useState<string>("");
  const [row3CustomEmulatedPower, setRow3CustomEmulatedPower] = useState<string>("");
  const [row1FeatInput, setRow1FeatInput] = useState<string>("");
  const [row2FeatInput, setRow2FeatInput] = useState<string>("");
  const [row3FeatInput, setRow3FeatInput] = useState<string>("");
  const [row1AttackType, setRow1AttackType] = useState<string>('Unarmed');
  const [row1Weapon, setRow1Weapon] = useState<string>(MELEE_WEAPONS[0]);
  const [row1DamageType, setRow1DamageType] = useState<string>(DAMAGE_TYPES[0]);
  const [row1CanTurnOff, setRow1CanTurnOff] = useState<boolean>(false);
  const [row2AttackType, setRow2AttackType] = useState<string>('Unarmed');
  const [row2Weapon, setRow2Weapon] = useState<string>(MELEE_WEAPONS[0]);
  const [row2DamageType, setRow2DamageType] = useState<string>(DAMAGE_TYPES[0]);
  const [row2CanTurnOff, setRow2CanTurnOff] = useState<boolean>(false);
  const [row3AttackType, setRow3AttackType] = useState<string>('Unarmed');
  const [row3Weapon, setRow3Weapon] = useState<string>(MELEE_WEAPONS[0]);
  const [row3DamageType, setRow3DamageType] = useState<string>(DAMAGE_TYPES[0]);
  const [row3CanTurnOff, setRow3CanTurnOff] = useState<boolean>(false);

  useEffect(() => {
    // Skill sets
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
    } else {
      setRow2SkillSet("");
      setRow2CustomSkill("");
    }
    if (isSkillBased && selectedSkillSets[2]) {
      const name = selectedSkillSets[2].name;
      if (skillSetOptions.includes(name)) {
        setRow3SkillSet(name);
      } else {
        setRow3SkillSet("custom");
        setRow3CustomSkill(name);
      }
    } else if (isSkillBased) {
      setRow3SkillSet("");
      setRow3CustomSkill("");
    }

    const featByRow = (row: number) =>
      (selectedFeats as any[]).find((f) => (f as any).row === row);

    const f0 = featByRow(0);
    if (f0) {
      setRow1Feat(f0.name);
      if (f0.abilityChoices) {
        setRow1Ability1(f0.abilityChoices[0] || "");
        setRow1Ability2(f0.abilityChoices[1] || "");
      }
      if (f0.powerChoices) {
        setRow1Power1(f0.powerChoices[0] || "");
        setRow1Power2(f0.powerChoices[1] || "");
      }
      if (f0.name === "Attack Focus" && typeof f0.input === "string") {
        setRow1FeatInput(f0.input);
      } else {
        setRow1FeatInput("");
      }
      if (f0.powerTrick) {
        setRow1StuntType("trick");
        const trick = f0.powerTrick;
        if (availablePowerTricks.includes(trick)) {
          setRow1PowerTrick(trick);
        } else {
          setRow1PowerTrick("custom");
          setRow1CustomPowerTrick(trick);
        }
      } else if (f0.emulatedPower) {
        setRow1StuntType("emulated");
        setRow1EmulatedParent(f0.emulatedFrom || "");
        setRow1EmulatedPower(f0.emulatedPower);
      } else if (f0.acquiredPower) {
        setRow1NewPower(f0.acquiredPower);
        if (f0.acquiredPower === 'Enhanced Melee Attack') {
          setRow1AttackType(f0.attackType || 'Unarmed');
          setRow1Weapon(f0.weapon || MELEE_WEAPONS[0]);
          setRow1DamageType(f0.damageType || DAMAGE_TYPES[0]);
          setRow1CanTurnOff(!!f0.canTurnOff);
        }
      }
    } else {
      setRow1Feat("");
      setRow1Ability1("");
      setRow1Ability2("");
      setRow1Power1("");
      setRow1Power2("");
      setRow1FeatInput("");
      setRow1StuntType("");
      setRow1PowerTrick("");
      setRow1CustomPowerTrick("");
      setRow1EmulatedParent("");
      setRow1EmulatedPower("");
      setRow1NewPower("");
      setRow1CustomEmulatedPower("");
      setRow1AttackType('Unarmed');
      setRow1Weapon(MELEE_WEAPONS[0]);
      setRow1DamageType(DAMAGE_TYPES[0]);
      setRow1CanTurnOff(false);
    }

    const f1 = featByRow(1);
    if (f1) {
      setRow2Feat(f1.name);
      if (f1.abilityChoices) {
        setRow2Ability1(f1.abilityChoices[0] || "");
        setRow2Ability2(f1.abilityChoices[1] || "");
      }
      if (f1.powerChoices) {
        setRow2Power1(f1.powerChoices[0] || "");
        setRow2Power2(f1.powerChoices[1] || "");
      }
      if (f1.name === "Attack Focus" && typeof f1.input === "string") {
        setRow2FeatInput(f1.input);
      } else {
        setRow2FeatInput("");
      }
      if (f1.powerTrick) {
        setRow2StuntType("trick");
        const trick = f1.powerTrick;
        if (availablePowerTricks.includes(trick)) {
          setRow2PowerTrick(trick);
        } else {
          setRow2PowerTrick("custom");
          setRow2CustomPowerTrick(trick);
        }
      } else if (f1.emulatedPower) {
        setRow2StuntType("emulated");
        setRow2EmulatedParent(f1.emulatedFrom || "");
        setRow2EmulatedPower(f1.emulatedPower);
      } else if (f1.acquiredPower) {
        setRow2NewPower(f1.acquiredPower);
        if (f1.acquiredPower === 'Enhanced Melee Attack') {
          setRow2AttackType(f1.attackType || 'Unarmed');
          setRow2Weapon(f1.weapon || MELEE_WEAPONS[0]);
          setRow2DamageType(f1.damageType || DAMAGE_TYPES[0]);
          setRow2CanTurnOff(!!f1.canTurnOff);
        }
      }
    } else {
      setRow2Feat("");
      setRow2Ability1("");
      setRow2Ability2("");
      setRow2Power1("");
      setRow2Power2("");
      setRow2FeatInput("");
      setRow2StuntType("");
      setRow2PowerTrick("");
      setRow2CustomPowerTrick("");
      setRow2EmulatedParent("");
      setRow2EmulatedPower("");
      setRow2NewPower("");
      setRow2CustomEmulatedPower("");
      setRow2AttackType('Unarmed');
      setRow2Weapon(MELEE_WEAPONS[0]);
      setRow2DamageType(DAMAGE_TYPES[0]);
      setRow2CanTurnOff(false);
    }

    const f2 = isSkillBased ? featByRow(2) : undefined;
    if (isSkillBased && f2) {
      setRow3Feat(f2.name);
      if (f2.abilityChoices) {
        setRow3Ability1(f2.abilityChoices[0] || "");
        setRow3Ability2(f2.abilityChoices[1] || "");
      }
      if (f2.powerChoices) {
        setRow3Power1(f2.powerChoices[0] || "");
        setRow3Power2(f2.powerChoices[1] || "");
      }
      if (f2.input && f2.name === "Attack Focus" && typeof f2.input === "string") {
        setRow3FeatInput(f2.input);
      } else {
        setRow3FeatInput("");
      }
      if (f2.powerTrick) {
        setRow3StuntType("trick");
        const trick = f2.powerTrick;
        if (availablePowerTricks.includes(trick)) {
          setRow3PowerTrick(trick);
        } else {
          setRow3PowerTrick("custom");
          setRow3CustomPowerTrick(trick);
        }
      } else if (f2.emulatedPower) {
        setRow3StuntType("emulated");
        setRow3EmulatedParent(f2.emulatedFrom || "");
        setRow3EmulatedPower(f2.emulatedPower);
      } else if (f2.acquiredPower) {
        setRow3NewPower(f2.acquiredPower);
        if (f2.acquiredPower === 'Enhanced Melee Attack') {
          setRow3AttackType(f2.attackType || 'Unarmed');
          setRow3Weapon(f2.weapon || MELEE_WEAPONS[0]);
          setRow3DamageType(f2.damageType || DAMAGE_TYPES[0]);
          setRow3CanTurnOff(!!f2.canTurnOff);
        }
      }
    } else if (isSkillBased) {
      setRow3Feat("");
      setRow3Ability1("");
      setRow3Ability2("");
      setRow3Power1("");
      setRow3Power2("");
      setRow3FeatInput("");
      setRow3StuntType("");
      setRow3PowerTrick("");
      setRow3CustomPowerTrick("");
      setRow3EmulatedParent("");
      setRow3EmulatedPower("");
      setRow3NewPower("");
      setRow3CustomEmulatedPower("");
      setRow3AttackType('Unarmed');
      setRow3Weapon(MELEE_WEAPONS[0]);
      setRow3DamageType(DAMAGE_TYPES[0]);
      setRow3CanTurnOff(false);
    }

    // Populate maneuver selections for feats that grant maneuvers
    if (f0?.name === "Learn Combat Maneuver") {
      setRow1Maneuver(typeof f0.input === "string" ? f0.input : "");
      setRow1Leadership1("");
      setRow1Leadership2("");
    } else if (f0?.name === "Natural Born Leader") {
      const inputs = Array.isArray(f0.input) ? f0.input : [];
      setRow1Leadership1(inputs[0] || "");
      setRow1Leadership2(inputs[1] || "");
      setRow1Maneuver("");
    } else {
      setRow1Maneuver("");
      setRow1Leadership1("");
      setRow1Leadership2("");
    }
    if (f1?.name === "Learn Combat Maneuver") {
      setRow2Maneuver(typeof f1.input === "string" ? f1.input : "");
      setRow2Leadership1("");
      setRow2Leadership2("");
    } else if (f1?.name === "Natural Born Leader") {
      const inputs = Array.isArray(f1.input) ? f1.input : [];
      setRow2Leadership1(inputs[0] || "");
      setRow2Leadership2(inputs[1] || "");
      setRow2Maneuver("");
    } else {
      setRow2Maneuver("");
      setRow2Leadership1("");
      setRow2Leadership2("");
    }
    if (isSkillBased && f2?.name === "Learn Combat Maneuver") {
      setRow3Maneuver(typeof f2.input === "string" ? f2.input : "");
      setRow3Leadership1("");
      setRow3Leadership2("");
    } else if (isSkillBased && f2?.name === "Natural Born Leader") {
      const inputs = Array.isArray(f2.input) ? f2.input : [];
      setRow3Leadership1(inputs[0] || "");
      setRow3Leadership2(inputs[1] || "");
      setRow3Maneuver("");
    } else if (isSkillBased) {
      setRow3Maneuver("");
      setRow3Leadership1("");
      setRow3Leadership2("");
    }
  }, [
    isSkillBased,
    selectedSkillSets,
    selectedFeats,
    availablePowerTricks,
  ]);

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
      : row1Feat === "Natural Born Leader"
      ? row1Leadership1 !== "" &&
        row1Leadership2 !== "" &&
        maneuverMeetsReqs(row1Leadership1) &&
        maneuverMeetsReqs(row1Leadership2)
      : row1Feat === "Ability Score Increase"
      ? abilityIncreaseValid(row1Ability1, row1Ability2)
      : row1Feat.startsWith("Power Score Increase")
      ? powerIncreaseValid(row1Power1)
      : row1Feat.startsWith("Acquire New Power")
      ? row1NewPower !== ""
      : row1Feat.startsWith("Master Power Trick")
      ? row1PowerTrick !== "" &&
        (row1PowerTrick !== "custom" || row1CustomPowerTrick.trim() !== "")
      : row1Feat.startsWith("Master Emulated Power")
      ? row1EmulatedParent !== "" &&
        row1EmulatedPower !== "" &&
        (row1EmulatedPower !== "custom" ||
          row1CustomEmulatedPower.trim() !== "")
      : isPowerStuntFeat(row1Feat)
      ? row1StuntType === "trick"
        ? row1PowerTrick !== "" &&
          (row1PowerTrick !== "custom" || row1CustomPowerTrick.trim() !== "")
        : row1StuntType === "emulated"
        ? row1EmulatedParent !== "" && row1EmulatedPower !== ""
        : false
      : row1Feat === "Attack Focus"
      ? row1FeatInput.trim() !== ""
      : true);
  const row2Valid = row2SkillSet
    ? row2SkillSet === "custom"
      ? row2CustomSkill.trim() !== ""
      : true
    : row2Feat !== "" &&
      (row2Feat === "Learn Combat Maneuver"
        ? row2Maneuver !== "" && maneuverMeetsReqs(row2Maneuver)
        : row2Feat === "Natural Born Leader"
        ? row2Leadership1 !== "" &&
          row2Leadership2 !== "" &&
          maneuverMeetsReqs(row2Leadership1) &&
          maneuverMeetsReqs(row2Leadership2)
        : row2Feat === "Ability Score Increase"
        ? abilityIncreaseValid(row2Ability1, row2Ability2)
        : row2Feat.startsWith("Power Score Increase")
        ? powerIncreaseValid(row2Power1)
        : row2Feat.startsWith("Acquire New Power")
        ? row2NewPower !== ""
        : row2Feat.startsWith("Master Power Trick")
        ? row2PowerTrick !== "" &&
          (row2PowerTrick !== "custom" ||
            row2CustomPowerTrick.trim() !== "")
        : row2Feat.startsWith("Master Emulated Power")
        ? row2EmulatedParent !== "" &&
          row2EmulatedPower !== "" &&
          (row2EmulatedPower !== "custom" ||
            row2CustomEmulatedPower.trim() !== "")
        : isPowerStuntFeat(row2Feat)
        ? row2StuntType === "trick"
          ? row2PowerTrick !== "" &&
            (row2PowerTrick !== "custom" || row2CustomPowerTrick.trim() !== "")
          : row2StuntType === "emulated"
          ? row2EmulatedParent !== "" && row2EmulatedPower !== ""
          : false
        : row2Feat === "Attack Focus"
        ? row2FeatInput.trim() !== ""
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
        : row3Feat === "Natural Born Leader"
        ? row3Leadership1 !== "" &&
          row3Leadership2 !== "" &&
          maneuverMeetsReqs(row3Leadership1) &&
          maneuverMeetsReqs(row3Leadership2)
        : row3Feat === "Ability Score Increase"
        ? abilityIncreaseValid(row3Ability1, row3Ability2)
        : row3Feat.startsWith("Power Score Increase")
        ? powerIncreaseValid(row3Power1)
        : row3Feat.startsWith("Acquire New Power")
        ? row3NewPower !== ""
        : row3Feat.startsWith("Master Power Trick")
        ? row3PowerTrick !== "" &&
          (row3PowerTrick !== "custom" ||
            row3CustomPowerTrick.trim() !== "")
        : row3Feat.startsWith("Master Emulated Power")
        ? row3EmulatedParent !== "" &&
          row3EmulatedPower !== "" &&
          (row3EmulatedPower !== "custom" ||
            row3CustomEmulatedPower.trim() !== "")
        : isPowerStuntFeat(row3Feat)
        ? row3StuntType === "trick"
          ? row3PowerTrick !== "" &&
            (row3PowerTrick !== "custom" || row3CustomPowerTrick.trim() !== "")
          : row3StuntType === "emulated"
          ? row3EmulatedParent !== "" && row3EmulatedPower !== ""
          : false
        : row3Feat === "Attack Focus"
        ? row3FeatInput.trim() !== ""
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
      emulatedFrom?: string;
      emulatedPower?: string;
      acquiredPower?: string;
      attackType?: string;
      weapon?: string;
      damageType?: string;
      canTurnOff?: boolean;
      input?: string | string[];
      row: number;
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
        emulatedFrom?: string;
        emulatedPower?: string;
        acquiredPower?: string;
        input?: string | string[];
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
      if (row1Feat.startsWith("Acquire New Power") && row1NewPower) {
        feat.acquiredPower = row1NewPower;
        if (row1NewPower === 'Enhanced Melee Attack') {
          (feat as any).attackType = row1AttackType;
          if (row1AttackType === 'Weapon') {
            (feat as any).weapon = row1Weapon;
          } else {
            (feat as any).damageType = row1DamageType;
            (feat as any).canTurnOff = row1CanTurnOff;
          }
        }
      }
      if (row1Feat.startsWith("Master Power Trick")) {
        feat.powerTrick =
          row1PowerTrick === "custom" ? row1CustomPowerTrick : row1PowerTrick;
      }
      if (row1Feat.startsWith("Master Emulated Power")) {
        feat.emulatedFrom = row1EmulatedParent;
        feat.emulatedPower =
          row1EmulatedPower === "custom"
            ? row1CustomEmulatedPower
            : row1EmulatedPower;
      }
      if (isPowerStuntFeat(row1Feat)) {
        if (row1StuntType === "trick") {
          feat.powerTrick =
            row1PowerTrick === "custom" ? row1CustomPowerTrick : row1PowerTrick;
        } else if (row1StuntType === "emulated") {
          feat.emulatedFrom = row1EmulatedParent;
          feat.emulatedPower = row1EmulatedPower;
        }
      }
      if (row1Feat === "Attack Focus" && row1FeatInput) {
        (feat as any).input = row1FeatInput;
      }
      if (row1Feat === "Learn Combat Maneuver" && row1Maneuver) {
        feat.input = row1Maneuver;
        maneuversSelected.push({ name: row1Maneuver });
      }
      if (row1Feat === "Natural Born Leader") {
        const inputs: string[] = [];
        if (row1Leadership1) {
          inputs.push(row1Leadership1);
          maneuversSelected.push({ name: row1Leadership1 });
        }
        if (row1Leadership2) {
          inputs.push(row1Leadership2);
          maneuversSelected.push({ name: row1Leadership2 });
        }
        if (inputs.length > 0) feat.input = inputs;
      }
      featsSelected.push({ ...feat, row: 0 });
    }
    if (row2Feat) {
      const feat: {
        name: string;
        abilityChoices?: string[];
        powerChoices?: string[];
        powerTrick?: string;
        emulatedFrom?: string;
        emulatedPower?: string;
        acquiredPower?: string;
        input?: string | string[];
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
      if (row2Feat.startsWith("Acquire New Power") && row2NewPower) {
        feat.acquiredPower = row2NewPower;
        if (row2NewPower === 'Enhanced Melee Attack') {
          (feat as any).attackType = row2AttackType;
          if (row2AttackType === 'Weapon') {
            (feat as any).weapon = row2Weapon;
          } else {
            (feat as any).damageType = row2DamageType;
            (feat as any).canTurnOff = row2CanTurnOff;
          }
        }
      }
      if (row2Feat.startsWith("Master Power Trick")) {
        feat.powerTrick =
          row2PowerTrick === "custom" ? row2CustomPowerTrick : row2PowerTrick;
      }
      if (row2Feat.startsWith("Master Emulated Power")) {
        feat.emulatedFrom = row2EmulatedParent;
        feat.emulatedPower =
          row2EmulatedPower === "custom"
            ? row2CustomEmulatedPower
            : row2EmulatedPower;
      }
      if (isPowerStuntFeat(row2Feat)) {
        if (row2StuntType === "trick") {
          feat.powerTrick =
            row2PowerTrick === "custom" ? row2CustomPowerTrick : row2PowerTrick;
        } else if (row2StuntType === "emulated") {
          feat.emulatedFrom = row2EmulatedParent;
          feat.emulatedPower = row2EmulatedPower;
        }
      }
      if (row2Feat === "Attack Focus" && row2FeatInput) {
        (feat as any).input = row2FeatInput;
      }
      if (row2Feat === "Learn Combat Maneuver" && row2Maneuver) {
        feat.input = row2Maneuver;
        maneuversSelected.push({ name: row2Maneuver });
      }
      if (row2Feat === "Natural Born Leader") {
        const inputs: string[] = [];
        if (row2Leadership1) {
          inputs.push(row2Leadership1);
          maneuversSelected.push({ name: row2Leadership1 });
        }
        if (row2Leadership2) {
          inputs.push(row2Leadership2);
          maneuversSelected.push({ name: row2Leadership2 });
        }
        if (inputs.length > 0) feat.input = inputs;
      }
      featsSelected.push({ ...feat, row: 1 });
    }
    if (isSkillBased && row3Feat) {
      const feat: {
        name: string;
        abilityChoices?: string[];
        powerChoices?: string[];
        powerTrick?: string;
        emulatedFrom?: string;
        emulatedPower?: string;
        acquiredPower?: string;
        input?: string | string[];
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
      if (row3Feat.startsWith("Acquire New Power") && row3NewPower) {
        feat.acquiredPower = row3NewPower;
        if (row3NewPower === 'Enhanced Melee Attack') {
          (feat as any).attackType = row3AttackType;
          if (row3AttackType === 'Weapon') {
            (feat as any).weapon = row3Weapon;
          } else {
            (feat as any).damageType = row3DamageType;
            (feat as any).canTurnOff = row3CanTurnOff;
          }
        }
      }
      if (row3Feat.startsWith("Master Power Trick")) {
        feat.powerTrick =
          row3PowerTrick === "custom" ? row3CustomPowerTrick : row3PowerTrick;
      }
      if (row3Feat.startsWith("Master Emulated Power")) {
        feat.emulatedFrom = row3EmulatedParent;
        feat.emulatedPower =
          row3EmulatedPower === "custom"
            ? row3CustomEmulatedPower
            : row3EmulatedPower;
      }
      if (isPowerStuntFeat(row3Feat)) {
        if (row3StuntType === "trick") {
          feat.powerTrick =
            row3PowerTrick === "custom" ? row3CustomPowerTrick : row3PowerTrick;
        } else if (row3StuntType === "emulated") {
          feat.emulatedFrom = row3EmulatedParent;
          feat.emulatedPower = row3EmulatedPower;
        }
      }
      if (row3Feat === "Attack Focus" && row3FeatInput) {
        (feat as any).input = row3FeatInput;
      }
      if (row3Feat === "Learn Combat Maneuver" && row3Maneuver) {
        feat.input = row3Maneuver;
        maneuversSelected.push({ name: row3Maneuver });
      }
      if (row3Feat === "Natural Born Leader") {
        const inputs: string[] = [];
        if (row3Leadership1) {
          inputs.push(row3Leadership1);
          maneuversSelected.push({ name: row3Leadership1 });
        }
        if (row3Leadership2) {
          inputs.push(row3Leadership2);
          maneuversSelected.push({ name: row3Leadership2 });
        }
        if (inputs.length > 0) feat.input = inputs;
      }
      featsSelected.push({ ...feat, row: 2 });
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
      if (f.name.startsWith("Acquire New Power") && f.acquiredPower) {
        const newPower: any = {
          name: f.acquiredPower,
          score: 12,
          finalScore: 12,
        };
        if (f.acquiredPower === 'Enhanced Melee Attack') {
          newPower.attackType = (f as any).attackType || 'Unarmed';
          if (newPower.attackType === 'Weapon') {
            newPower.weapon = (f as any).weapon;
          } else {
            newPower.damageType = (f as any).damageType;
            newPower.canTurnOff = (f as any).canTurnOff;
          }
        }
        if (f.acquiredPower === 'Surge') {
          newPower.paceType = 'Running';
        }
        powers.push(newPower);
      }
      if (f.name.startsWith("Master Emulated Power") && f.emulatedPower) {
        const parent = powers.find((p) => p.name === f.emulatedFrom);
        const base = parent
          ? (parent.finalScore ?? parent.score ?? 10) + 2
          : 12;
        const finalScore = Math.min(25, base);
        powers.push({
          name: f.emulatedPower,
          score: finalScore,
          finalScore,
        } as any);
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
      const { row, ...feat } = f;
      if (!mergedFeats.some((existing) => existing.name === feat.name)) {
        mergedFeats.push(feat);
      }
    });
    updateCharacterField("feats", mergedFeats as any);
    const existingManeuvers = character.maneuvers || [];
    const mergedManeuvers = [
      ...existingManeuvers.filter(
        (m: any) => !maneuversSelected.some((n) => n.name === m.name)
      ),
      ...maneuversSelected,
    ];
    updateCharacterField("maneuvers", mergedManeuvers as any);
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

  const renderLeadershipSelect = (
    value: string,
    setValue: (v: string) => void
  ) => (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="mt-2">
        <SelectValue placeholder="Select maneuver" />
      </SelectTrigger>
      <SelectContent>
        {leadershipManeuvers.map((m: any) => {
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
    setCustom: (v: string) => void
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
          {availablePowerTricks.map((t) => (
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

  const renderNewPowerSelect = (
    value: string,
    setValue: (v: string) => void,
    attackType: string,
    setAttackType: (v: string) => void,
    weapon: string,
    setWeapon: (v: string) => void,
    damageType: string,
    setDamageType: (v: string) => void,
    canTurnOff: boolean,
    setCanTurnOff: (v: boolean) => void
  ) => (
    <div className="mt-2 space-y-2">
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          if (v === 'Enhanced Melee Attack') {
            setAttackType('Unarmed');
            setWeapon(MELEE_WEAPONS[0]);
            setDamageType(DAMAGE_TYPES[0]);
            setCanTurnOff(false);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select power" />
        </SelectTrigger>
        <SelectContent>
          {availableNewPowers.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === 'Enhanced Melee Attack' && (
        <div className="space-y-2">
          <div>
            <Label className="text-sm">Attack Type</Label>
            <Select value={attackType} onValueChange={setAttackType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select attack type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unarmed">Unarmed Melee Attack</SelectItem>
                <SelectItem value="Weapon">Enhanced Melee Weapon Attack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {attackType === 'Weapon' ? (
            <div>
              <Label className="text-sm">Melee Weapon</Label>
              <Select value={weapon} onValueChange={setWeapon}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select weapon" />
                </SelectTrigger>
                <SelectContent>
                  {MELEE_WEAPONS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-sm">Damage Type</Label>
                <Select value={damageType} onValueChange={setDamageType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select damage type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_TYPES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={canTurnOff} onCheckedChange={setCanTurnOff} />
                <Label className="text-sm">Can be turned on/off</Label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderStuntTypeSelect = (
    value: string,
    setValue: (v: string) => void
  ) => (
    <div className="mt-2">
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select stunt type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trick">Power Trick</SelectItem>
          <SelectItem value="emulated">Emulated Power</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderEmulatedSelect = (
    parent: string,
    setParent: (v: string) => void,
    child: string,
    setChild: (v: string) => void,
    custom: string,
    setCustom: (v: string) => void,
    allowCustom = false
  ) => (
    <div className="mt-2 space-y-2">
      <Select
        value={parent}
        onValueChange={(v) => {
          setParent(v);
          setChild("");
          if (allowCustom) setCustom("");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select power" />
        </SelectTrigger>
        <SelectContent>
          {availableEmulatedParents.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {parent && (
        <>
          <Select
            value={child}
            onValueChange={(v) => {
              setChild(v);
              if (allowCustom && v !== "custom") setCustom("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select emulated power" />
            </SelectTrigger>
            <SelectContent>
              {(emulatedPowerMap[parent] || []).map((ep) => (
                <SelectItem key={ep} value={ep}>
                  {ep}
                </SelectItem>
              ))}
              {allowCustom && <SelectItem value="custom">Custom...</SelectItem>}
            </SelectContent>
          </Select>
          {allowCustom && child === "custom" && (
            <Input
              className="mt-2"
              placeholder="Enter emulated power"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          )}
        </>
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
              setRow1FeatInput("");
              setRow1Maneuver("");
              setRow1Leadership1("");
              setRow1Leadership2("");
              setRow1Ability1("");
              setRow1Ability2("");
              setRow1Power1("");
              setRow1Power2("");
              setRow1PowerTrick("");
              setRow1CustomPowerTrick("");
              setRow1StuntType("");
              setRow1EmulatedParent("");
              setRow1EmulatedPower("");
              setRow1NewPower("");
              setRow1CustomEmulatedPower("");
              setRow1AttackType('Unarmed');
              setRow1Weapon(MELEE_WEAPONS[0]);
              setRow1DamageType(DAMAGE_TYPES[0]);
              setRow1CanTurnOff(false);
            })}
            {row1Feat === "Attack Focus" && (
              <Input
                className="mt-2"
                placeholder="Target attack or power"
                value={row1FeatInput}
                onChange={(e) => setRow1FeatInput(e.target.value)}
              />
            )}
            {row1Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row1Maneuver, setRow1Maneuver)}
            {row1Feat === "Natural Born Leader" && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Maneuver 1</label>
                  {renderLeadershipSelect(row1Leadership1, setRow1Leadership1)}
                </div>
                <div>
                  <label className="block text-sm mb-1">Maneuver 2</label>
                  {renderLeadershipSelect(row1Leadership2, setRow1Leadership2)}
                </div>
              </div>
            )}
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
            {row1Feat.startsWith("Acquire New Power") &&
              renderNewPowerSelect(
                row1NewPower,
                setRow1NewPower,
                row1AttackType,
                setRow1AttackType,
                row1Weapon,
                setRow1Weapon,
                row1DamageType,
                setRow1DamageType,
                row1CanTurnOff,
                setRow1CanTurnOff
              )}
            {row1Feat.startsWith("Master Power Trick") &&
              renderPowerTrickSelect(
                row1PowerTrick,
                setRow1PowerTrick,
                row1CustomPowerTrick,
                setRow1CustomPowerTrick
              )}
            {row1Feat.startsWith("Master Emulated Power") &&
              renderEmulatedSelect(
                row1EmulatedParent,
                setRow1EmulatedParent,
                row1EmulatedPower,
                setRow1EmulatedPower,
                row1CustomEmulatedPower,
                setRow1CustomEmulatedPower,
                true
              )}
            {isPowerStuntFeat(row1Feat) && (
              <>
                {renderStuntTypeSelect(row1StuntType, (v) => {
                  setRow1StuntType(v);
                  setRow1PowerTrick("");
                  setRow1CustomPowerTrick("");
                  setRow1EmulatedParent("");
                  setRow1EmulatedPower("");
                })}
                {row1StuntType === "trick" &&
                  renderPowerTrickSelect(
                    row1PowerTrick,
                    setRow1PowerTrick,
                    row1CustomPowerTrick,
                    setRow1CustomPowerTrick
                  )}
                {row1StuntType === "emulated" &&
                  renderEmulatedSelect(
                    row1EmulatedParent,
                    setRow1EmulatedParent,
                    row1EmulatedPower,
                    setRow1EmulatedPower,
                    row1CustomEmulatedPower,
                    setRow1CustomEmulatedPower
                  )}
              </>
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
                setRow2Leadership1("");
                setRow2Leadership2("");
                setRow2Ability1("");
                setRow2Ability2("");
                setRow2Power1("");
                setRow2Power2("");
                setRow2PowerTrick("");
                setRow2CustomPowerTrick("");
                setRow2StuntType("");
                setRow2EmulatedParent("");
                setRow2EmulatedPower("");
                setRow2NewPower("");
                setRow2CustomEmulatedPower("");
                setRow2AttackType('Unarmed');
                setRow2Weapon(MELEE_WEAPONS[0]);
                setRow2DamageType(DAMAGE_TYPES[0]);
                setRow2CanTurnOff(false);
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
                setRow2FeatInput("");
                setRow2Maneuver("");
                setRow2Leadership1("");
                setRow2Leadership2("");
                setRow2AttackType('Unarmed');
                setRow2Weapon(MELEE_WEAPONS[0]);
                setRow2DamageType(DAMAGE_TYPES[0]);
                setRow2CanTurnOff(false);
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
                  setRow2NewPower("");
                  setRow2CustomEmulatedPower("");
                  setRow2Leadership1("");
                  setRow2Leadership2("");
                }
              },
              !!row2SkillSet,
              true
            )}
            {row2Feat === "Attack Focus" && (
              <Input
                className="mt-2"
                placeholder="Target attack or power"
                value={row2FeatInput}
                onChange={(e) => setRow2FeatInput(e.target.value)}
              />
            )}
            {row2Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row2Maneuver, setRow2Maneuver)}
            {row2Feat === "Natural Born Leader" && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Maneuver 1</label>
                  {renderLeadershipSelect(row2Leadership1, setRow2Leadership1)}
                </div>
                <div>
                  <label className="block text-sm mb-1">Maneuver 2</label>
                  {renderLeadershipSelect(row2Leadership2, setRow2Leadership2)}
                </div>
              </div>
            )}
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
            {row2Feat.startsWith("Acquire New Power") &&
              renderNewPowerSelect(
                row2NewPower,
                setRow2NewPower,
                row2AttackType,
                setRow2AttackType,
                row2Weapon,
                setRow2Weapon,
                row2DamageType,
                setRow2DamageType,
                row2CanTurnOff,
                setRow2CanTurnOff
              )}
            {row2Feat.startsWith("Master Power Trick") &&
              renderPowerTrickSelect(
                row2PowerTrick,
                setRow2PowerTrick,
                row2CustomPowerTrick,
                setRow2CustomPowerTrick
              )}
            {row2Feat.startsWith("Master Emulated Power") &&
              renderEmulatedSelect(
                row2EmulatedParent,
                setRow2EmulatedParent,
                row2EmulatedPower,
                setRow2EmulatedPower,
                row2CustomEmulatedPower,
                setRow2CustomEmulatedPower,
                true
              )}
            {isPowerStuntFeat(row2Feat) && (
              <>
                {renderStuntTypeSelect(row2StuntType, (v) => {
                  setRow2StuntType(v);
                  setRow2PowerTrick("");
                  setRow2CustomPowerTrick("");
                  setRow2EmulatedParent("");
                  setRow2EmulatedPower("");
                })}
                {row2StuntType === "trick" &&
                  renderPowerTrickSelect(
                    row2PowerTrick,
                    setRow2PowerTrick,
                    row2CustomPowerTrick,
                    setRow2CustomPowerTrick
                  )}
                {row2StuntType === "emulated" &&
                  renderEmulatedSelect(
                    row2EmulatedParent,
                    setRow2EmulatedParent,
                    row2EmulatedPower,
                    setRow2EmulatedPower,
                    row2CustomEmulatedPower,
                    setRow2CustomEmulatedPower
                  )}
              </>
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
                  setRow3Leadership1("");
                  setRow3Leadership2("");
                  setRow3Ability1("");
                  setRow3Ability2("");
                  setRow3Power1("");
                  setRow3Power2("");
                  setRow3PowerTrick("");
                setRow3CustomPowerTrick("");
                setRow3StuntType("");
                setRow3EmulatedParent("");
                setRow3EmulatedPower("");
                setRow3NewPower("");
                setRow3CustomEmulatedPower("");
                setRow3AttackType('Unarmed');
                setRow3Weapon(MELEE_WEAPONS[0]);
                setRow3DamageType(DAMAGE_TYPES[0]);
                setRow3CanTurnOff(false);
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
                setRow3FeatInput("");
                setRow3Maneuver("");
                setRow3Leadership1("");
                setRow3Leadership2("");
                setRow3AttackType('Unarmed');
                setRow3Weapon(MELEE_WEAPONS[0]);
                setRow3DamageType(DAMAGE_TYPES[0]);
                setRow3CanTurnOff(false);
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
                  setRow3NewPower("");
                  setRow3CustomEmulatedPower("");
                  setRow3Leadership1("");
                  setRow3Leadership2("");
                  setRow3AttackType('Unarmed');
                  setRow3Weapon(MELEE_WEAPONS[0]);
                  setRow3DamageType(DAMAGE_TYPES[0]);
                  setRow3CanTurnOff(false);
                }
              },
              !!row3SkillSet,
              true
            )}
            {row3Feat === "Attack Focus" && (
              <Input
                className="mt-2"
                placeholder="Target attack or power"
                value={row3FeatInput}
                onChange={(e) => setRow3FeatInput(e.target.value)}
              />
            )}
            {row3Feat === "Learn Combat Maneuver" &&
              renderManeuverSelect(row3Maneuver, setRow3Maneuver)}
            {row3Feat === "Natural Born Leader" && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Maneuver 1</label>
                  {renderLeadershipSelect(row3Leadership1, setRow3Leadership1)}
                </div>
                <div>
                  <label className="block text-sm mb-1">Maneuver 2</label>
                  {renderLeadershipSelect(row3Leadership2, setRow3Leadership2)}
                </div>
              </div>
            )}
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
              {row3Feat.startsWith("Acquire New Power") &&
                renderNewPowerSelect(
                  row3NewPower,
                  setRow3NewPower,
                  row3AttackType,
                  setRow3AttackType,
                  row3Weapon,
                  setRow3Weapon,
                  row3DamageType,
                  setRow3DamageType,
                  row3CanTurnOff,
                  setRow3CanTurnOff
                )}
              {row3Feat.startsWith("Master Power Trick") &&
                renderPowerTrickSelect(
                  row3PowerTrick,
                  setRow3PowerTrick,
                  row3CustomPowerTrick,
                  setRow3CustomPowerTrick
                )}
              {row3Feat.startsWith("Master Emulated Power") &&
                renderEmulatedSelect(
                  row3EmulatedParent,
                  setRow3EmulatedParent,
                  row3EmulatedPower,
                  setRow3EmulatedPower,
                  row3CustomEmulatedPower,
                  setRow3CustomEmulatedPower,
                  true
                )}
              {isPowerStuntFeat(row3Feat) && (
                <>
                  {renderStuntTypeSelect(row3StuntType, (v) => {
                    setRow3StuntType(v);
                    setRow3PowerTrick("");
                    setRow3CustomPowerTrick("");
                    setRow3EmulatedParent("");
                    setRow3EmulatedPower("");
                  })}
                  {row3StuntType === "trick" &&
                    renderPowerTrickSelect(
                      row3PowerTrick,
                      setRow3PowerTrick,
                      row3CustomPowerTrick,
                      setRow3CustomPowerTrick
                    )}
                  {row3StuntType === "emulated" &&
                    renderEmulatedSelect(
                      row3EmulatedParent,
                      setRow3EmulatedParent,
                      row3EmulatedPower,
                      setRow3EmulatedPower,
                      row3CustomEmulatedPower,
                      setRow3CustomEmulatedPower
                    )}
                </>
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

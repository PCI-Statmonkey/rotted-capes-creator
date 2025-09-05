import { useState, useEffect } from "react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";

const BUILDER_STORAGE_KEY = "rotted-capes-builder";

export type CharacterSkill = {
  name: string;
  focuses: string[];
};

export type Character = {
  abilityScores: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  rank: number;
  level: number;
  rankBonus: number;
  grit: number;
  startingSkills: string[];
  selectedSkills: CharacterSkill[];
  selectedFeats: {
    name: string;
    input?: string | string[];
    source?: string;
    free?: boolean;
    skillSet?: string;
    edge?: string;
    option?: string;
    stance?: string;
    usesPerScene?: number;
    abilityChoices?: string[];
    powerChoices?: string[];
    powerTrick?: string;
    emulatedFrom?: string;
    emulatedPower?: string;
    row?: number;
  }[];
  selectedSkillSets: { name: string; edges: string[]; source?: string; deepCutNotes?: string }[];
  selectedManeuvers: string[];
  skillsTab: string;
  currentStep: number;
  archetypeFeat?: string | string[] | null;
  abilityMethod?: "pointBuy" | "standardArray";
};

export const useCharacterBuilder = () => {
  const saved = loadFromLocalStorage(BUILDER_STORAGE_KEY) as Partial<Character> | null;

  const [startingSkills, setStartingSkills] = useState<string[]>(saved?.startingSkills || []);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>(saved?.selectedSkills || []);
  const [selectedFeats, setSelectedFeats] = useState<{
    name: string;
    input?: string | string[];
    source?: string;
    free?: boolean;
    skillSet?: string;
    edge?: string;
    option?: string;
    stance?: string;
    usesPerScene?: number;
    abilityChoices?: string[];
    powerChoices?: string[];
    powerTrick?: string;
    emulatedFrom?: string;
    emulatedPower?: string;
    row?: number;
  }[]>(saved?.selectedFeats || []);
  const initialSkillSets = (saved?.selectedSkillSets || []).map((s: any) =>
    typeof s === 'string'
      ? { name: s, edges: [], deepCutNotes: "" }
      : { name: s.name, edges: s.edges || (s.edge ? [s.edge] : []), source: s.source, deepCutNotes: s.deepCutNotes || "" }
  );
  const [selectedSkillSets, setSelectedSkillSets] = useState<{ name: string; edges: string[]; source?: string; deepCutNotes?: string }[]>(initialSkillSets);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(saved?.selectedManeuvers || []);
  const [skillsTab, setSkillsTab] = useState<string>(saved?.skillsTab || "starting");
  const [currentStep, setCurrentStep] = useState<number>(saved?.currentStep || 1);
  const [archetypeFeat, setArchetypeFeat] = useState<string | string[] | null>(saved?.archetypeFeat || null);
  const [abilityScores, setAbilityScores] = useState(saved?.abilityScores || {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });
  const [rank, setRank] = useState<number>(saved?.rank || 2);
  const [level, setLevel] = useState<number>(saved?.level || 1);
  const [rankBonus, setRankBonus] = useState<number>(saved?.rankBonus || 2);
  const [grit, setGrit] = useState<number>(saved?.grit || 2);
  const [abilityMethod, setAbilityMethod] = useState<"pointBuy" | "standardArray">(
    saved?.abilityMethod || "pointBuy"
  );

  const resetBuilder = () => {
    localStorage.removeItem(BUILDER_STORAGE_KEY);
    setStartingSkills([]);
    setSelectedSkills([]);
    setSelectedFeats([]);
    setSelectedSkillSets([]);
    setSelectedManeuvers([]);
    setSkillsTab("starting");
    setArchetypeFeat(null);
    setAbilityScores({
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    });
    setRank(2);
    setLevel(1);
    setRankBonus(2);
    setGrit(2);
    setCurrentStep(1);
    setAbilityMethod("pointBuy");
  };

  useEffect(() => {
    saveToLocalStorage(BUILDER_STORAGE_KEY, {
      abilityScores,
      startingSkills,
      selectedSkills,
      selectedFeats,
      selectedSkillSets,
      selectedManeuvers,
      skillsTab,
      currentStep,
      archetypeFeat,
      abilityMethod,
      rank,
      level,
      rankBonus,
      grit,
    });
  }, [abilityScores, startingSkills, selectedSkills, selectedFeats, selectedSkillSets, selectedManeuvers, skillsTab, currentStep, archetypeFeat, abilityMethod, rank, level, rankBonus, grit]);

  return {
    abilityScores,
    setAbilityScores,
    startingSkills,
    setStartingSkills,
    selectedSkills,
    setSelectedSkills,
    selectedFeats,
    setSelectedFeats,
    selectedSkillSets,
    setSelectedSkillSets,
    selectedManeuvers,
    setSelectedManeuvers,
    skillsTab,
    setSkillsTab,
    currentStep,
    setCurrentStep,
    archetypeFeat,
    setArchetypeFeat,
    rank,
    setRank,
    level,
    setLevel,
    rankBonus,
    setRankBonus,
    grit,
    setGrit,
    abilityMethod,
    setAbilityMethod,
    resetBuilder,
  };
};

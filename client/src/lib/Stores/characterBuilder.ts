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
  selectedFeats: { name: string; input?: string | string[]; source?: string; free?: boolean; skillSet?: string; edge?: string; option?: string; stance?: string; usesPerScene?: number }[];
  selectedSkillSets: { name: string; edges: string[]; source?: string; deepCutNotes?: string }[];
  selectedManeuvers: string[];
  startingManeuver: string;
  skillsTab: string;
  currentStep: number;
  archetypeSkill?: string | null;
};

export const useCharacterBuilder = () => {
  const saved = loadFromLocalStorage(BUILDER_STORAGE_KEY) as Partial<Character> | null;

  const [startingSkills, setStartingSkills] = useState<string[]>(saved?.startingSkills || []);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>(saved?.selectedSkills || []);
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string | string[]; source?: string; free?: boolean; skillSet?: string; edge?: string; option?: string; stance?: string; usesPerScene?: number }[]>(saved?.selectedFeats || []);
  const initialSkillSets = (saved?.selectedSkillSets || []).map((s: any) =>
    typeof s === 'string'
      ? { name: s, edges: [], deepCutNotes: "" }
      : { name: s.name, edges: s.edges || (s.edge ? [s.edge] : []), source: s.source, deepCutNotes: s.deepCutNotes || "" }
  );
  const [selectedSkillSets, setSelectedSkillSets] = useState<{ name: string; edges: string[]; source?: string; deepCutNotes?: string }[]>(initialSkillSets);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(saved?.selectedManeuvers || []);
  const [startingManeuver, setStartingManeuver] = useState<string>(saved?.startingManeuver || "");
  const [skillsTab, setSkillsTab] = useState<string>(saved?.skillsTab || "starting");
  const [currentStep, setCurrentStep] = useState<number>(saved?.currentStep || 1);
  const [archetypeSkill, setArchetypeSkill] = useState<string | null>(saved?.archetypeSkill || null);
  const [abilityScores, setAbilityScores] = useState(saved?.abilityScores || {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });
  const [rank, setRank] = useState<number>(saved?.rank || 1);
  const [level, setLevel] = useState<number>(saved?.level || 1);
  const [rankBonus, setRankBonus] = useState<number>(saved?.rankBonus || 1);
  const [grit, setGrit] = useState<number>(saved?.grit || 1);

  const resetBuilder = () => {
    localStorage.removeItem(BUILDER_STORAGE_KEY);
    setStartingSkills([]);
    setSelectedSkills([]);
    setSelectedFeats([]);
    setSelectedSkillSets([]);
    setSelectedManeuvers([]);
    setStartingManeuver("");
    setSkillsTab("starting");
    setArchetypeSkill(null);
    setAbilityScores({
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    });
    setRank(1);
    setLevel(1);
    setRankBonus(1);
    setGrit(1);
    setCurrentStep(1);
  };

  useEffect(() => {
    saveToLocalStorage(BUILDER_STORAGE_KEY, {
      abilityScores,
      startingSkills,
      selectedSkills,
      selectedFeats,
      selectedSkillSets,
      selectedManeuvers,
      startingManeuver,
      skillsTab,
      currentStep,
      archetypeSkill,
      rank,
      level,
      rankBonus,
      grit,
    });
  }, [abilityScores, startingSkills, selectedSkills, selectedFeats, selectedSkillSets, selectedManeuvers, startingManeuver, skillsTab, currentStep, archetypeSkill, rank, level, rankBonus, grit]);

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
    startingManeuver,
    setStartingManeuver,
    skillsTab,
    setSkillsTab,
    currentStep,
    setCurrentStep,
    archetypeSkill,
    setArchetypeSkill,
    rank,
    setRank,
    level,
    setLevel,
    rankBonus,
    setRankBonus,
    grit,
    setGrit,
    resetBuilder,
  };
};

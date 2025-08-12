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
  startingSkills: string[];
  selectedSkills: CharacterSkill[];
  selectedFeats: { name: string; input?: string | string[]; source?: string; free?: boolean }[];
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
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string | string[]; source?: string; free?: boolean }[]>(saved?.selectedFeats || []);
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
    });
  }, [abilityScores, startingSkills, selectedSkills, selectedFeats, selectedSkillSets, selectedManeuvers, startingManeuver, skillsTab, currentStep, archetypeSkill]);

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
    resetBuilder,
  };
};

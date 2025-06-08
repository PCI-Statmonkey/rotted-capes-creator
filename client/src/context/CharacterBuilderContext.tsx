import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loadFromLocalStorage, saveToLocalStorage, BUILDER_STORAGE_KEY } from "@/lib/utils";

export type CharacterSkill = {
  name: string;
  focus?: string;
};

interface CharacterBuilderState {
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
  selectedFeats: { name: string; input?: string }[];
  selectedSkillSets: string[];
  selectedManeuvers: string[];
  startingFeat: string;
  archetype: string;
  currentStep: number;
}

interface CharacterBuilderContextValue extends CharacterBuilderState {
  setAbilityScores: (scores: CharacterBuilderState["abilityScores"]) => void;
  setStartingSkills: (skills: string[]) => void;
  setSelectedSkills: (skills: CharacterSkill[]) => void;
  setSelectedFeats: (feats: { name: string; input?: string }[]) => void;
  setSelectedSkillSets: (sets: string[]) => void;
  setSelectedManeuvers: (moves: string[]) => void;
  setStartingFeat: (feat: string) => void;
  setArchetype: (archetype: string) => void;
  setCurrentStep: (step: number) => void;
}

const CharacterBuilderContext = createContext<CharacterBuilderContextValue | undefined>(undefined);

export const CharacterBuilderProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadFromLocalStorage(BUILDER_STORAGE_KEY) as Partial<CharacterBuilderState> | null;
  const [abilityScores, setAbilityScores] = useState<CharacterBuilderState["abilityScores"]>(
    saved?.abilityScores || {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    }
  );
  const [startingSkills, setStartingSkills] = useState<string[]>(saved?.startingSkills || []);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>(saved?.selectedSkills || []);
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string }[]>(
    saved?.selectedFeats || []
  );
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>(saved?.selectedSkillSets || []);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(saved?.selectedManeuvers || []);
  const [startingFeat, setStartingFeat] = useState<string>(saved?.startingFeat || "");
  const [archetype, setArchetype] = useState<string>(saved?.archetype || "");
  const [currentStep, setCurrentStep] = useState<number>(saved?.currentStep || 1);

  // Persist state to local storage whenever it changes
  useEffect(() => {
    const state: CharacterBuilderState = {
      abilityScores,
      startingSkills,
      selectedSkills,
      selectedFeats,
      selectedSkillSets,
      selectedManeuvers,
      startingFeat,
      archetype,
      currentStep,
    };
    saveToLocalStorage(BUILDER_STORAGE_KEY, state);
  }, [abilityScores, startingSkills, selectedSkills, selectedFeats, selectedSkillSets, selectedManeuvers, startingFeat, archetype, currentStep]);

  const value: CharacterBuilderContextValue = {
    abilityScores,
    startingSkills,
    selectedSkills,
    selectedFeats,
    selectedSkillSets,
    selectedManeuvers,
    startingFeat,
    archetype,
    currentStep,
    setAbilityScores,
    setStartingSkills,
    setSelectedSkills,
    setSelectedFeats,
    setSelectedSkillSets,
    setSelectedManeuvers,
    setStartingFeat,
    setArchetype,
    setCurrentStep,
  };

  return (
    <CharacterBuilderContext.Provider value={value}>{children}</CharacterBuilderContext.Provider>
  );
};

export const useCharacterBuilder = () => {
  const ctx = useContext(CharacterBuilderContext);
  if (!ctx) {
    throw new Error("useCharacterBuilder must be used within CharacterBuilderProvider");
  }
  return ctx;
};


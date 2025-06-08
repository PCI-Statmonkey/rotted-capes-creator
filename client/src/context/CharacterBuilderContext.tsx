import React, { createContext, useContext, useState, ReactNode } from "react";

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
  const [abilityScores, setAbilityScores] = useState<CharacterBuilderState["abilityScores"]>({
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });
  const [startingSkills, setStartingSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>([]);
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string }[]>([]);
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>([]);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>([]);
  const [startingFeat, setStartingFeat] = useState<string>("");
  const [archetype, setArchetype] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

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


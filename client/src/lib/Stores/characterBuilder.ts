import { useState } from "react";

export type CharacterSkill = {
  name: string;
  focus?: string;
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
  selectedFeats: { name: string; input?: string }[];
  selectedSkillSets: string[];
  selectedManeuvers: string[];
  startingFeat: string;
  startingManeuver: string;
  currentStep: number;
};

export const useCharacterBuilder = () => {
  const [startingSkills, setStartingSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>([]);
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string }[]>([]);
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>([]);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>([]);
  const [startingFeat, setStartingFeat] = useState<string>("");
  const [startingManeuver, setStartingManeuver] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [abilityScores, setAbilityScores] = useState({
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });

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
    startingFeat,
    setStartingFeat,
    startingManeuver,
    setStartingManeuver,
    currentStep,
    setCurrentStep,
  };
};

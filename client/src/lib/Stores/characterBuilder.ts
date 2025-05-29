import { useState } from "react";

export type CharacterSkill = {
  name: string;
  focus?: string;
};

export type Character = {
  startingSkills: string[];
  selectedSkills: CharacterSkill[];
  selectedFeats: string[];
  selectedSkillSets: string[];
  selectedManeuver: string | null;
  startingFeat: string;
  currentStep: number;
};

export const useCharacterBuilder = () => {
  const [startingSkills, setStartingSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>([]);
  const [selectedFeats, setSelectedFeats] = useState<string[]>([]);
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>([]);
  const [selectedManeuver, setSelectedManeuver] = useState<string | null>(null);
  const [startingFeat, setStartingFeat] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);

  return {
    startingSkills,
    setStartingSkills,
    selectedSkills,
    setSelectedSkills,
    selectedFeats,
    setSelectedFeats,
    selectedSkillSets,
    setSelectedSkillSets,
    selectedManeuver,
    setSelectedManeuver,
    startingFeat,
    setStartingFeat,
    currentStep,
    setCurrentStep,
  };
};

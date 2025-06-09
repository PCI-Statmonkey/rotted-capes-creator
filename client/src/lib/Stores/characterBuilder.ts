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
  selectedFeats: { name: string; input?: string }[];
  selectedSkillSets: string[];
  selectedManeuvers: string[];
  startingManeuver: string;
  currentStep: number;
};

export const useCharacterBuilder = () => {
  const saved = loadFromLocalStorage(BUILDER_STORAGE_KEY) as Partial<Character> | null;

  const [startingSkills, setStartingSkills] = useState<string[]>(saved?.startingSkills || []);
  const [selectedSkills, setSelectedSkills] = useState<CharacterSkill[]>(saved?.selectedSkills || []);
  const [selectedFeats, setSelectedFeats] = useState<{ name: string; input?: string }[]>(saved?.selectedFeats || []);
  const [selectedSkillSets, setSelectedSkillSets] = useState<string[]>(saved?.selectedSkillSets || []);
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(saved?.selectedManeuvers || []);
  const [startingManeuver, setStartingManeuver] = useState<string>(saved?.startingManeuver || "");
  const [currentStep, setCurrentStep] = useState<number>(saved?.currentStep || 1);
  const [abilityScores, setAbilityScores] = useState(saved?.abilityScores || {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });

  useEffect(() => {
    saveToLocalStorage(BUILDER_STORAGE_KEY, {
      abilityScores,
      startingSkills,
      selectedSkills,
      selectedFeats,
      selectedSkillSets,
      selectedManeuvers,
      startingManeuver,
      currentStep,
    });
  }, [abilityScores, startingSkills, selectedSkills, selectedFeats, selectedSkillSets, selectedManeuvers, startingManeuver, currentStep]);

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
    currentStep,
    setCurrentStep,
  };
};

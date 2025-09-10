import { createContext, useContext, useState, ReactNode } from "react";
import { getThreatParameter, THREAT_PARAMETERS } from "@/data/threatParameters";

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Defenses {
  avoidance: number;
  fortitude: number;
  willpower: number;
}

export interface AttackInfo {
  single: number;
  area: number;
}

export interface DamageInfo {
  min: number;
  max: number;
  avg: number;
}

export interface Threat {
  name: string;
  rank: string;
  role: string;
  size: string;
  type: string;
  abilityScores: AbilityScores;
  defenses: Defenses;
  stamina: number;
  wounds: number;
  attack: AttackInfo;
  damage: DamageInfo;
  initiative: number;
  pace: string;
  traits: string[];
  skillSets: string[];
  advanced: boolean;
  effectiveRank: number; // for advanced averaging
}

const defaultThreat: Threat = {
  name: "",
  rank: "Zeta",
  role: "",
  size: "Medium",
  type: "",
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  defenses: { avoidance: 0, fortitude: 0, willpower: 0 },
  stamina: 0,
  wounds: 0,
  attack: { single: 0, area: 0 },
  damage: { min: 0, max: 0, avg: 0 },
  initiative: 0,
  pace: "",
  traits: [],
  skillSets: [],
  advanced: false,
  effectiveRank: 1,
};

interface ThreatContextType {
  threat: Threat;
  setThreat: React.Dispatch<React.SetStateAction<Threat>>;
  updateThreatField: (field: keyof Threat, value: any) => void;
  addTrait: (trait: string) => void;
  removeTrait: (index: number) => void;
  addSkillSet: (skill: string) => void;
  removeSkillSet: (index: number) => void;
  currentStep: number;
  setCurrentStep: (n: number) => void;
  applyParameters: (label: string) => void;
  applyAdvancedParameters: (defenseLabel: string, durabilityLabel: string, attackLabel: string) => void;
}

const ThreatContext = createContext<ThreatContextType | undefined>(undefined);

export function ThreatProvider({ children }: { children: ReactNode }) {
  const [threat, setThreat] = useState<Threat>(() => {
    const base = { ...defaultThreat };
    const params = getThreatParameter(base.rank);
    if (params) {
      base.defenses = {
        avoidance: params.defenses[0],
        fortitude: params.defenses[1],
        willpower: params.defenses[2],
      };
      base.stamina = params.stamina;
      base.wounds = params.wounds;
      base.attack = { single: params.toHit[0], area: params.toHit[1] };
      base.damage = { ...params.damage };
      base.effectiveRank = params.rank;
    }
    return base;
  });
  const [currentStep, setCurrentStep] = useState(1);

  const updateThreatField = (field: keyof Threat, value: any) => {
    setThreat((prev) => ({ ...prev, [field]: value }));
  };

  const addTrait = (trait: string) => {
    setThreat((prev) => ({ ...prev, traits: [...prev.traits, trait] }));
  };

  const removeTrait = (index: number) => {
    setThreat((prev) => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index),
    }));
  };

  const addSkillSet = (skill: string) => {
    setThreat((prev) => ({ ...prev, skillSets: [...prev.skillSets, skill] }));
  };

  const removeSkillSet = (index: number) => {
    setThreat((prev) => ({
      ...prev,
      skillSets: prev.skillSets.filter((_, i) => i !== index),
    }));
  };

  const applyParameters = (label: string) => {
    const params = getThreatParameter(label);
    if (!params) return;
    setThreat((prev) => ({
      ...prev,
      rank: label,
      defenses: {
        avoidance: params.defenses[0],
        fortitude: params.defenses[1],
        willpower: params.defenses[2],
      },
      stamina: params.stamina,
      wounds: params.wounds,
      attack: { single: params.toHit[0], area: params.toHit[1] },
      damage: { ...params.damage },
      effectiveRank: params.rank,
    }));
  };

  const applyAdvancedParameters = (
    defenseLabel: string,
    durabilityLabel: string,
    attackLabel: string,
  ) => {
    const def = getThreatParameter(defenseLabel) || THREAT_PARAMETERS[0];
    const dur = getThreatParameter(durabilityLabel) || THREAT_PARAMETERS[0];
    const atk = getThreatParameter(attackLabel) || THREAT_PARAMETERS[0];
    const avg = ((def.rank + dur.rank + atk.rank) / 3).toFixed(2);
    setThreat((prev) => ({
      ...prev,
      defenses: {
        avoidance: def.defenses[0],
        fortitude: def.defenses[1],
        willpower: def.defenses[2],
      },
      stamina: dur.stamina,
      wounds: dur.wounds,
      attack: { single: atk.toHit[0], area: atk.toHit[1] },
      damage: { ...atk.damage },
      effectiveRank: parseFloat(avg),
    }));
  };

  const value: ThreatContextType = {
    threat,
    setThreat,
    updateThreatField,
    addTrait,
    removeTrait,
    addSkillSet,
    removeSkillSet,
    currentStep,
    setCurrentStep,
    applyParameters,
    applyAdvancedParameters,
  };

  return <ThreatContext.Provider value={value}>{children}</ThreatContext.Provider>;
}

export function useThreat() {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error("useThreat must be used within a ThreatProvider");
  }
  return context;
}

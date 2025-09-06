import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STORAGE_KEY, saveToLocalStorage, loadFromLocalStorage, getScoreData } from "@/lib/utils";
import type { MasterValue } from "@shared/masterValues";
import { trackCharacterEvent, trackEvent } from "@/lib/analytics";
import { getRankCap } from "../utils/rank";
import { getEffectiveAbilities } from "@/utils/abilityBonuses";
const DEFAULT_RANK_BONUS = 2; // Starting rank bonus

export interface Ability extends Omit<MasterValue, "min" | "max"> {
  value: number;
}

export interface Abilities {
  strength: Ability;
  dexterity: Ability;
  constitution: Ability;
  intelligence: Ability;
  wisdom: Ability;
  charisma: Ability;
}

export interface Skill {
  name: string;
  ability: string;
  ranks: number;
  specialization?: string;
  trained: boolean;
}

export interface Power {
  name: string;
  description: string;
  cost?: number; // Optional now
  rank?: number; // Optional now
  score?: number; // New field for power score
  finalScore?: number; // New field for final power score after modifiers
  damageType?: string; // Optional damage type
  attackType?: string; // For Enhanced Melee Attack mode
  weapon?: string; // Selected melee weapon for Enhanced Melee Attack
  canTurnOff?: boolean; // Whether unarmed attack can be toggled
  ability?: string;
  sense?: string;
  linkedPowers?: string[];
  burnout?: number;
  perks: string[];
  flaws: string[];
}

export interface Complication {
  name: string;
  description: string;
  points?: number;
  type?: string;
}

export interface WeaknessAllocation {
  type: string;
  target: string;
  amount: number;
}

export interface GearItem {
  name: string;
  description: string;
  ap?: number;
  starting?: boolean;
  batteryPowered?: boolean;
}

export interface Feat {
  name: string;
  source?: string;
  skillSetName?: string;
  abilityChoices?: (keyof Abilities)[];
  powerChoices?: string[];
  powerTrick?: string;
  emulatedFrom?: string;
  emulatedPower?: string;
  acquiredPower?: string;
  /** Optional user input for feats like Attack Focus */
  input?: string | string[];
}

export interface Maneuver {
  name: string;
}

export interface Character {
  id: string;
  firebaseId?: string;  // ID in Firebase storage
  ownerId?: string;     // User ID who owns this character
  name: string;
  secretIdentity: string;
  concept: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  appearance: string;
  origin: string;
  archetype: string;
  personalityFlaws: string[];
  tagline: string;
  rank: number;
  level: number;
  rankBonus: number;
  grit: number;
  abilities: Abilities;
  skills: Skill[];
  powers: Power[];
  complications: Complication[];
  gear: GearItem[];
  feats: Feat[];
  maneuvers: Maneuver[];
  weaknessAllocations: WeaknessAllocation[];
  defense: number;
  toughness: number;
  fortitude: number;
  reflex: number;
  willpower: number;
  initiative: number;
  burnoutThreshold: number;
  currentBurnout: number;
  burnoutChecks: number;
  pointsSpent: {
    abilities: number;
    skills: number;
    powers: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Characters begin with ability scores of 8 so that point buy starts at 0
export const defaultAbilities: Abilities = {
  strength: { value: 8, ...getScoreData(8) },
  dexterity: { value: 8, ...getScoreData(8) },
  constitution: { value: 8, ...getScoreData(8) },
  intelligence: { value: 8, ...getScoreData(8) },
  wisdom: { value: 8, ...getScoreData(8) },
  charisma: { value: 8, ...getScoreData(8) },
};

export const createEmptyCharacter = (): Character => ({
  id: crypto.randomUUID(),
  name: "",
  secretIdentity: "",
  concept: "",
  gender: "",
  age: "",
  height: "",
  weight: "",
  appearance: "",
  origin: "",
  archetype: "",
  personalityFlaws: [],
  tagline: "",
  rank: 2,
  level: 1,
  rankBonus: DEFAULT_RANK_BONUS,
  grit: DEFAULT_RANK_BONUS,
  abilities: { ...defaultAbilities },
  skills: [],
  powers: [] as Power[],
  complications: [],
  gear: [],
  feats: [],
  maneuvers: [],
  weaknessAllocations: [],
  defense: 10,
  toughness: 0,
  fortitude: 0,
  reflex: 0,
  willpower: 0,
  initiative: 0,
  burnoutThreshold: 10,
  currentBurnout: 0,
  burnoutChecks: 0,
  pointsSpent: {
    abilities: 0,
    skills: 0,
    powers: 0,
    total: 0,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface CharacterContextType {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  currentStep: number;
  currentSubStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setCurrentSubStep: React.Dispatch<React.SetStateAction<number>>;
  updateCharacterField: <K extends keyof Character>(field: K, value: Character[K]) => void;
  updateAbilityScore: (ability: keyof Abilities, value: number) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (index: number) => void;
  addPower: (power: Power) => void;
  removePower: (index: number) => void;
  addComplication: (complication: Complication) => void;
  removeComplication: (index: number) => void;
  addGearItem: (item: GearItem) => void;
  removeGearItem: (index: number) => void;
  resetCharacter: () => void;
  saveCharacter: () => void;
  loadCharacter: (id: string) => void;
  updateDerivedStats: () => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Character>(() => {
    const savedCharacter = loadFromLocalStorage(STORAGE_KEY);
    return savedCharacter ? savedCharacter : createEmptyCharacter();
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState(0);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEY, character);
  }, [character]);

  const updateCharacterField = <K extends keyof Character>(field: K, value: Character[K]) => {
    setCharacter((prev) => {
      let newValue: any = value;
      if (field === 'powers') {
        const cap = getRankCap(prev.rank);
        newValue = (value as Power[]).map(p => ({ ...p, rank: Math.min(p.rank ?? 0, cap) }));
      }
      const updatedCharacter = {
        ...prev,
        [field]: newValue,
        updatedAt: new Date().toISOString(),
      };

      // Auto-save to local storage whenever a field is updated
      saveToLocalStorage(STORAGE_KEY, updatedCharacter);

      return updatedCharacter;
    });
  };

  const updateAbilityScore = (ability: keyof Abilities, value: number) => {
    setCharacter((prev) => {
      const cap = getRankCap(prev.rank);
      const capped = Math.min(value, cap);
      const data = getScoreData(capped);
      return {
        ...prev,
        abilities: {
          ...prev.abilities,
          [ability]: {
            value: capped,
            ...data,
          },
        },
        updatedAt: new Date().toISOString(),
      };
    });
    updateDerivedStats();
  };

  const addSkill = (skill: Skill) => {
    setCharacter((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeSkill = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addPower = (power: Power) => {
    setCharacter((prev) => {
      const cap = getRankCap(prev.rank);
      const newPower = { ...power, rank: Math.min(power.rank ?? 0, cap) };
      return {
        ...prev,
        powers: [...prev.powers, newPower],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const removePower = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      powers: prev.powers.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addComplication = (complication: Complication) => {
    setCharacter((prev) => ({
      ...prev,
      complications: [...prev.complications, complication],
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeComplication = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      complications: prev.complications.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addGearItem = (item: GearItem) => {
    setCharacter((prev) => ({
      ...prev,
      gear: [...prev.gear, item],
      updatedAt: new Date().toISOString(),
    }));
  };

  const removeGearItem = (index: number) => {
    setCharacter((prev) => ({
      ...prev,
      gear: prev.gear.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const resetCharacter = () => {
    setCharacter(createEmptyCharacter());
    setCurrentStep(1);
  };

  const saveCharacter = async () => {
    // Save to local storage for offline usage
    saveToLocalStorage(STORAGE_KEY, character);
    
    // Track character save event with Google Analytics
    trackCharacterEvent('character_saved', {
      name: character.name,
      origin: character.origin,
      archetype: character.archetype,
      abilities: Object.keys(character.abilities).map(key => ({
        name: key,
        value: character.abilities[key as keyof typeof character.abilities].value
      })),
      powers_count: character.powers.length,
      skills_count: character.skills.length
    });
    
    try {
      // If user is logged in, also save to Firebase
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const { saveCharacterToFirebase, updateCharacterInFirebase } = await import('@/lib/firebase');
        
        // Check if character already has a Firebase ID
        if (character.firebaseId) {
          await updateCharacterInFirebase(character.firebaseId, character);
          trackEvent('character_updated', 'cloud_storage', character.name);
        } else {
          const firebaseId = await saveCharacterToFirebase(character, currentUser.uid);
          
          // Update the character with the Firebase ID
          setCharacter(prev => ({
            ...prev,
            firebaseId,
            updatedAt: new Date().toISOString()
          }));
          
          trackEvent('character_created_cloud', 'cloud_storage', character.name);
        }
      }
    } catch (error) {
      console.error("Error saving character to cloud:", error);
      // We still have the local copy, so no data loss
      trackEvent('character_save_error', 'error', String(error));
    }
  };

  const loadCharacter = async (id: string) => {
    // First try to load from local storage
    const savedCharacter = loadFromLocalStorage(STORAGE_KEY);
    if (savedCharacter && (savedCharacter.id === id || savedCharacter.firebaseId === id)) {
      setCharacter(savedCharacter);
      trackEvent('character_loaded', 'local_storage', savedCharacter.name);
      return;
    }
    
    // If not found locally and user is logged in, try to load from Firebase
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const { getCharacterById } = await import('@/lib/firebase');
        const firebaseCharacter = await getCharacterById(id);
        
        if (firebaseCharacter) {
          // Convert the Firebase data to our Character type
          // The firebaseCharacter already has id and data spread together from firebase.ts
          const { id: firebaseId, ...characterData } = firebaseCharacter;
          const loadedCharacter = {
            ...createEmptyCharacter(),
            ...characterData,
            firebaseId,
            updatedAt: new Date().toISOString()
          };
          
          setCharacter(loadedCharacter);
          
          // Track the character loading event
          trackCharacterEvent('character_loaded_cloud', {
            name: loadedCharacter.name,
            origin: loadedCharacter.origin,
            archetype: loadedCharacter.archetype
          });
          
          // Also save to local storage for offline access
          saveToLocalStorage(STORAGE_KEY, loadedCharacter);
        } else {
          trackEvent('character_not_found', 'error', id);
        }
      }
    } catch (error) {
      console.error("Error loading character from cloud:", error);
      trackEvent('character_load_error', 'error', String(error));
    }
  };

  const updateDerivedStats = () => {
    const effectiveAbilities = getEffectiveAbilities(character);

    // Use effective abilities for derived stats
    setCharacter((prev) => ({
      ...prev,
      defense: 10 + Math.max(effectiveAbilities.dexterity.modifier, effectiveAbilities.intelligence.modifier) + prev.rankBonus,
      toughness: effectiveAbilities.constitution.modifier,
      fortitude: 10 + Math.max(effectiveAbilities.strength.modifier, effectiveAbilities.constitution.modifier) + prev.rankBonus,
      reflex: effectiveAbilities.dexterity.modifier,
      willpower: 10 + Math.max(effectiveAbilities.charisma.modifier, effectiveAbilities.wisdom.modifier) + prev.rankBonus,
      initiative: effectiveAbilities.dexterity.modifier,
      updatedAt: new Date().toISOString(),
    }));
  };

  const value = {
    character,
    setCharacter,
    currentStep,
    currentSubStep,
    setCurrentStep,
    setCurrentSubStep,
    updateCharacterField,
    updateAbilityScore,
    addSkill,
    removeSkill,
    addPower,
    removePower,
    addComplication,
    removeComplication,
    addGearItem,
    removeGearItem,
    resetCharacter,
    saveCharacter,
    loadCharacter,
    updateDerivedStats,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};

// Add a Theme Context for dark mode
export const ThemeContext = createContext({
  theme: "dark",
  setTheme: (theme: string) => {},
});

export const ThemeProvider = ({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultTheme?: string;
}) => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

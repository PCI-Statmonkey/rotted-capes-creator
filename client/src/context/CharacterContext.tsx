import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STORAGE_KEY, saveToLocalStorage, loadFromLocalStorage, calculateModifier } from "@/lib/utils";
import { trackCharacterEvent, trackEvent } from "@/lib/analytics";

export interface Ability {
  value: number;
  modifier: number;
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
  perks: string[];
  flaws: string[];
}

export interface Complication {
  name: string;
  description: string;
  points?: number;
  type?: string;
}

export interface GearItem {
  name: string;
  description: string;
}

export interface Feat {
  name: string;
  source?: string;
  skillSetName?: string;
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
  abilities: Abilities;
  skills: Skill[];
  powers: Power[];
  complications: Complication[];
  gear: GearItem[];
  feats: Feat[];
  maneuvers: Maneuver[];
  defense: number;
  toughness: number;
  fortitude: number;
  reflex: number;
  willpower: number;
  initiative: number;
  pointsSpent: {
    abilities: number;
    skills: number;
    powers: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const defaultAbilities: Abilities = {
  strength: { value: 10, modifier: 0 },
  dexterity: { value: 10, modifier: 0 },
  constitution: { value: 10, modifier: 0 },
  intelligence: { value: 10, modifier: 0 },
  wisdom: { value: 10, modifier: 0 },
  charisma: { value: 10, modifier: 0 },
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
  abilities: { ...defaultAbilities },
  skills: [],
  powers: [] as Power[],
  complications: [],
  gear: [],
  feats: [],
  maneuvers: [],
  defense: 10,
  toughness: 0,
  fortitude: 0,
  reflex: 0,
  willpower: 0,
  initiative: 0,
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
      const updatedCharacter = {
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };
      
      // Auto-save to local storage whenever a field is updated
      saveToLocalStorage(STORAGE_KEY, updatedCharacter);
      
      return updatedCharacter;
    });
  };

  const updateAbilityScore = (ability: keyof Abilities, value: number) => {
    const mod = calculateModifier(value);
    setCharacter((prev) => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [ability]: {
          value,
          modifier: mod,
        },
      },
      updatedAt: new Date().toISOString(),
    }));
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
    setCharacter((prev) => ({
      ...prev,
      powers: [...prev.powers, power],
      updatedAt: new Date().toISOString(),
    }));
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
    // Get ability bonuses from origin and archetype
    const getOriginBonus = (ability: string): number => {
      const abilityLower = ability.toLowerCase();
      // No origin selected yet
      if (!character.origin) return 0;
      
      // For newer origin formats that include type in parentheses
      const originName = character.origin.split('(')[0].trim();
      
      // Handle special cases for Highly Trained with custom ability bonuses
      if (originName === "Highly Trained" && character.origin.includes("Bonuses:")) {
        const bonusText = character.origin.match(/Bonuses: (.*)\)/)?.[1] || "";
        if (bonusText.includes(`+1 ${ability.charAt(0).toUpperCase() + ability.slice(1)}`)) {
          return 1;
        }
        return 0;
      }
      
      // Handle special cases for Mystic with subtypes
      if (originName === "Mystic" && character.origin.includes("(")) {
        // If it's in the format "Mystic (Subtype: bonuses)"
        if (character.origin.includes(":")) {
          const mysticType = character.origin.match(/Mystic \(([^:]+):/)?.[1]?.trim();
          
          if (mysticType === "Practitioner") {
            if (abilityLower === "wisdom") return 2;
            if (abilityLower === "charisma") return 1;
          } else if (mysticType === "The Chosen") {
            if (abilityLower === "wisdom") return 2;
            if (abilityLower === "constitution") return 1;
          } else if (mysticType === "Enchanter") {
            if (abilityLower === "wisdom") return 2;
            if (abilityLower === "intelligence") return 1;
          }
        } else {
          // Default fallback for older "Mystic" format
          if (abilityLower === "wisdom") return 2;
          if (abilityLower === "charisma") return 1;
        }
        
        return 0;
      }
      
      // Handle specific origins from the rulebook
      switch(originName) {
        case "Alien":
          if (abilityLower === "strength") return 2;
          break;
        case "Android":
          if (abilityLower === "intelligence") return 2;
          break;
        case "Cosmic":
          if (abilityLower === "constitution") return 1;
          // Second ability is user-selected, handled at character creation
          break;
        case "Demigod":
          // Ability is user-selected, handled at character creation
          break;
        case "Super-Human":
          if (abilityLower === "constitution") return 2;
          break;
        case "Tech Hero":
          if (abilityLower === "intelligence") return 2;
          break;
      }
      
      return 0;
    };
    
    const getArchetypeBonus = (ability: string): number => {
      const abilityLower = ability.toLowerCase();
      // No archetype selected yet
      if (!character.archetype) return 0;
      
      // Get just the archetype name without any additional info
      const archetypeName = character.archetype.split('(')[0].trim();
      
      // Use the exact archetypes from the rulebook
      switch(archetypeName) {
        case "Andromorph":
          if (abilityLower === "strength") return 1;
          if (abilityLower === "dexterity") return 1;
          break;
        case "Blaster":
          if (abilityLower === "dexterity") return 1;
          if (abilityLower === "charisma") return 1;
          break;
        case "Brawler":
          if (abilityLower === "strength") return 1;
          if (abilityLower === "dexterity") return 1;
          if (abilityLower === "constitution") return 1;
          break;
        case "Controller":
          if (abilityLower === "wisdom") return 1;
          if (abilityLower === "charisma") return 1;
          break;
        case "Heavy":
          if (abilityLower === "constitution") return 1;
          if (abilityLower === "strength") return 1;
          break;
        case "Infiltrator":
          if (abilityLower === "dexterity") return 1;
          if (abilityLower === "intelligence") return 1;
          break;
        case "Transporter":
          if (abilityLower === "dexterity") return 1;
          if (abilityLower === "wisdom") return 1;
          break;
        // Legacy archetypes for backward compatibility
        case "Bruiser":
          if (abilityLower === "strength") return 1;
          if (abilityLower === "constitution") return 1;
          break;
        case "Speedster":
          if (abilityLower === "dexterity") return 2;
          break;
        case "Defender":
          if (abilityLower === "constitution") return 2;
          break;
        case "Gadgeteer":
          if (abilityLower === "intelligence") return 2;
          break;
        case "Mentalist":
          if (abilityLower === "wisdom") return 1;
          if (abilityLower === "intelligence") return 1;
          break;
        case "Mastermind":
          if (abilityLower === "intelligence") return 1;
          if (abilityLower === "charisma") return 1;
          break;
        case "Shapeshifter":
          if (abilityLower === "constitution") return 1;
          if (abilityLower === "dexterity") return 1;
          break;
      }
      
      return 0;
    };
    
    // Calculate total bonuses including origin and archetype
    const getTotalBonus = (ability: string): number => {
      return getOriginBonus(ability) + getArchetypeBonus(ability);
    };
    
    // Calculate effective ability scores with bonuses
    const effectiveAbilities = {
      strength: {
        ...character.abilities.strength,
        value: character.abilities.strength.value + getTotalBonus('strength'),
        modifier: calculateModifier(character.abilities.strength.value + getTotalBonus('strength'))
      },
      dexterity: {
        ...character.abilities.dexterity,
        value: character.abilities.dexterity.value + getTotalBonus('dexterity'),
        modifier: calculateModifier(character.abilities.dexterity.value + getTotalBonus('dexterity'))
      },
      constitution: {
        ...character.abilities.constitution,
        value: character.abilities.constitution.value + getTotalBonus('constitution'),
        modifier: calculateModifier(character.abilities.constitution.value + getTotalBonus('constitution'))
      },
      intelligence: {
        ...character.abilities.intelligence,
        value: character.abilities.intelligence.value + getTotalBonus('intelligence'),
        modifier: calculateModifier(character.abilities.intelligence.value + getTotalBonus('intelligence'))
      },
      wisdom: {
        ...character.abilities.wisdom,
        value: character.abilities.wisdom.value + getTotalBonus('wisdom'),
        modifier: calculateModifier(character.abilities.wisdom.value + getTotalBonus('wisdom'))
      },
      charisma: {
        ...character.abilities.charisma,
        value: character.abilities.charisma.value + getTotalBonus('charisma'),
        modifier: calculateModifier(character.abilities.charisma.value + getTotalBonus('charisma'))
      }
    };
    
    // Use effective abilities for derived stats
    setCharacter((prev) => ({
      ...prev,
      defense: 10 + effectiveAbilities.dexterity.modifier,
      toughness: effectiveAbilities.constitution.modifier,
      fortitude: effectiveAbilities.constitution.modifier,
      reflex: effectiveAbilities.dexterity.modifier,
      willpower: effectiveAbilities.wisdom.modifier,
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

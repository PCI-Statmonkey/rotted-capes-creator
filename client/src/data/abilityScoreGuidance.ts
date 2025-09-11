// Ability score guidance based on threat creation rules
export interface AbilityScoreGuidance {
  rank: string;
  rankCap: number;
  recommendations: {
    [key: string]: {
      range: string;
      description: string;
    };
  };
}

export const ABILITY_SCORE_GUIDANCE: AbilityScoreGuidance[] = [
  {
    rank: "Bystander",
    rankCap: 20,
    recommendations: {
      strength: { range: "8-16", description: "Average human range" },
      dexterity: { range: "8-16", description: "Average human range" },
      constitution: { range: "8-16", description: "Average human range" },
      intelligence: { range: "8-16", description: "Average human range" },
      wisdom: { range: "8-16", description: "Average human range" },
      charisma: { range: "8-16", description: "Average human range" }
    }
  },
  {
    rank: "Hardened",
    rankCap: 20,
    recommendations: {
      strength: { range: "10-18", description: "Slightly above average" },
      dexterity: { range: "10-18", description: "Slightly above average" },
      constitution: { range: "12-18", description: "Hardened survivors are tougher" },
      intelligence: { range: "8-16", description: "Experience matters more than raw intelligence" },
      wisdom: { range: "12-18", description: "Survival instincts are keen" },
      charisma: { range: "8-16", description: "Leadership varies" }
    }
  },
  {
    rank: "Zeta",
    rankCap: 20,
    recommendations: {
      strength: { range: "12-20", description: "Enhanced capabilities begin to show" },
      dexterity: { range: "12-20", description: "Enhanced capabilities begin to show" },
      constitution: { range: "12-20", description: "Enhanced capabilities begin to show" },
      intelligence: { range: "8-20", description: "Varies widely by threat type" },
      wisdom: { range: "10-18", description: "Basic awareness" },
      charisma: { range: "6-18", description: "Varies by type and role" }
    }
  },
  {
    rank: "Epsilon",
    rankCap: 23,
    recommendations: {
      strength: { range: "14-23", description: "Clearly superhuman potential" },
      dexterity: { range: "14-23", description: "Clearly superhuman potential" },
      constitution: { range: "14-23", description: "Clearly superhuman potential" },
      intelligence: { range: "8-23", description: "Animals may be lower, powered individuals higher" },
      wisdom: { range: "10-20", description: "Enhanced awareness" },
      charisma: { range: "6-20", description: "Varies significantly by threat type" }
    }
  },
  {
    rank: "Delta",
    rankCap: 26,
    recommendations: {
      strength: { range: "16-26", description: "Distinctly superhuman" },
      dexterity: { range: "16-26", description: "Distinctly superhuman" },
      constitution: { range: "16-26", description: "Distinctly superhuman" },
      intelligence: { range: "4-26", description: "Abominations may be lower, others much higher" },
      wisdom: { range: "12-22", description: "Enhanced perception" },
      charisma: { range: "4-22", description: "Monstrous threats may be very low" }
    }
  },
  {
    rank: "Gamma",
    rankCap: 29,
    recommendations: {
      strength: { range: "18-29", description: "Clearly superhuman level" },
      dexterity: { range: "18-29", description: "Clearly superhuman level" },
      constitution: { range: "18-29", description: "Clearly superhuman level" },
      intelligence: { range: "4-29", description: "Wide range depending on threat nature" },
      wisdom: { range: "14-25", description: "High awareness and perception" },
      charisma: { range: "4-25", description: "Terror-inducing or charismatic leaders" }
    }
  },
  {
    rank: "Beta",
    rankCap: 33,
    recommendations: {
      strength: { range: "20-33", description: "Major threat level" },
      dexterity: { range: "20-33", description: "Major threat level" },
      constitution: { range: "20-33", description: "Major threat level" },
      intelligence: { range: "4-33", description: "Genius-level intellects possible" },
      wisdom: { range: "16-28", description: "Exceptional awareness" },
      charisma: { range: "4-28", description: "Terrifying or inspirational presence" }
    }
  },
  {
    rank: "Alpha",
    rankCap: 36,
    recommendations: {
      strength: { range: "22-36", description: "Legendary threat level" },
      dexterity: { range: "22-36", description: "Legendary threat level" },
      constitution: { range: "22-36", description: "Legendary threat level" },
      intelligence: { range: "4-36", description: "Superintelligence possible" },
      wisdom: { range: "18-30", description: "Near-omniscient awareness" },
      charisma: { range: "4-30", description: "Overwhelming presence" }
    }
  },
  {
    rank: "Theta",
    rankCap: 40,
    recommendations: {
      strength: { range: "24-40", description: "Epic threat level" },
      dexterity: { range: "24-40", description: "Epic threat level" },
      constitution: { range: "24-40", description: "Epic threat level" },
      intelligence: { range: "4-40", description: "Beyond human comprehension" },
      wisdom: { range: "20-35", description: "Cosmic awareness" },
      charisma: { range: "4-35", description: "Reality-altering presence" }
    }
  },
  {
    rank: "Sigma",
    rankCap: 45,
    recommendations: {
      strength: { range: "26-45", description: "World-ending threat level" },
      dexterity: { range: "26-45", description: "World-ending threat level" },
      constitution: { range: "26-45", description: "World-ending threat level" },
      intelligence: { range: "4-45", description: "Incomprehensible intellect" },
      wisdom: { range: "22-40", description: "Universal awareness" },
      charisma: { range: "4-40", description: "Divine or diabolic presence" }
    }
  },
  {
    rank: "Upsilon",
    rankCap: 50,
    recommendations: {
      strength: { range: "28-50", description: "Cosmic threat level" },
      dexterity: { range: "28-50", description: "Cosmic threat level" },
      constitution: { range: "28-50", description: "Cosmic threat level" },
      intelligence: { range: "4-50", description: "Beyond mortal understanding" },
      wisdom: { range: "24-45", description: "Omniscient potential" },
      charisma: { range: "4-45", description: "Reality-shaping force" }
    }
  },
  {
    rank: "Omega",
    rankCap: 50,
    recommendations: {
      strength: { range: "30-50", description: "Ultimate threat level" },
      dexterity: { range: "30-50", description: "Ultimate threat level" },
      constitution: { range: "30-50", description: "Ultimate threat level" },
      intelligence: { range: "4-50", description: "Omniscient capability" },
      wisdom: { range: "26-50", description: "Universal understanding" },
      charisma: { range: "4-50", description: "Universe-defining presence" }
    }
  }
];

export function getAbilityScoreGuidance(rank: string): AbilityScoreGuidance | undefined {
  return ABILITY_SCORE_GUIDANCE.find(g => g.rank === rank);
}
/**
 * Fallback sample data for when database connections fail
 * This provides demo content for admin pages while making it clear that it's sample data only
 */

// Sample Origins data
export const sampleOrigins = [
  {
    id: 0,
    name: "Alien",
    description: "You are not of this world. Whether you hail from a distant planet, are a member of an extraterrestrial species that has lived among humans for generations, or were transformed through unknown cosmic means, your physiology and manner mark you as something other than human.",
    abilityBonuses: { strength: 2, constitution: 2, charisma: -1, dexterity: 0, intelligence: 0, wisdom: 0 },
    specialAbility: "Alien Physiology: You can survive in environments that would be harmful to humans, such as toxic atmospheres or extreme temperatures.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Experiment",
    description: "You were either born in a laboratory or subjected to procedures that fundamentally altered your physical makeup. This process granted you enhanced capabilities but may have left physical or psychological scars.",
    abilityBonuses: { strength: 2, dexterity: 1, wisdom: -1, constitution: 0, intelligence: 0, charisma: 0 },
    specialAbility: "Enhanced Metabolism: Your body processes toxins and disease efficiently. You gain advantage on saves against poison and disease.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Augmented",
    description: "You've enhanced your natural abilities through cybernetics, genetic modification, or magical alteration. These enhancements define your capabilities and possibly your appearance.",
    abilityBonuses: { intelligence: 2, dexterity: 1, charisma: -1, strength: 0, constitution: 0, wisdom: 0 },
    specialAbility: "Integrated Systems: You can interface directly with technology, allowing you to control and access electronic systems with a thought.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Archetypes data
export const sampleArchetypes = [
  {
    id: 0,
    name: "Bruiser",
    description: "You're a force to be reckoned with, known for your physical prowess and intimidating presence. Whether trained in martial arts or just naturally tough, you excel at close-quarters combat and can withstand significant punishment.",
    specialAbility: "Intimidating Presence: You can use your strength score for Intimidation checks.",
    keyAbilities: { primary: "Strength", secondary: "Constitution" },
    trainedSkill: "Athletics",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Speedster",
    description: "You move with incredible speed and agility, outpacing normal human capabilities. Your reflexes are lightning-fast, and you can perform feats of dexterity that seem impossible to others.",
    specialAbility: "Rapid Movement: You can move an additional 30 feet as part of your movement action.",
    keyAbilities: { primary: "Dexterity", secondary: "Constitution" },
    trainedSkill: "Acrobatics",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Mastermind",
    description: "Your intellect is your greatest weapon. You analyze situations, predict outcomes, and develop complex strategies with ease. Your enhanced mental capabilities allow you to solve problems others find impossible.",
    specialAbility: "Tactical Analysis: Once per day, you can grant a +2 bonus to an ally's attack roll or skill check by analyzing the situation and providing guidance.",
    keyAbilities: { primary: "Intelligence", secondary: "Wisdom" },
    trainedSkill: "Investigation",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];


// Sample Feats data
export const sampleFeats = [
  {
    id: 0,
    name: "Power Attack",
    description: "You can sacrifice accuracy for power in your melee attacks.",
    benefits: "When making a melee attack, you can take a -2 penalty to your attack roll to add +4 to your damage roll.",
    prerequisites: { strength: 13 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Defensive Combat",
    description: "You've learned techniques to protect yourself in combat.",
    benefits: "You gain a +2 bonus to your Armor Class when fighting defensively.",
    prerequisites: { dexterity: 13 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Quick Reflexes",
    description: "Your reactions are faster than normal.",
    benefits: "You gain a +2 bonus to initiative checks and can perform an additional reaction each round.",
    prerequisites: { dexterity: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Skill Sets data
export const sampleSkillSets = [
  {
    id: 0,
    name: "Former Delta Force Operative",
    description:
      "Elite military training adapted to the apocalypse, from close-quarters battle to survival tactics.",
    edges: ["Breaching Specialist", "Tactical Awareness"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Corporate Power Broker",
    description:
      "You knew how to pull strings and move resources in the boardroom; now those skills keep enclaves alive.",
    edges: ["Boardroom Shark", "Financial Leverage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Urban Explorer",
    description:
      "Navigating rooftops, tunnels, and ruins was your hobby; now it's how you keep ahead of the dead.",
    edges: ["Parkour Pro", "Knows Every Back Alley"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Powers data
export const samplePowers = [
  {
    id: 0,
    name: "Energy Blast",
    description: "You can project destructive energy from your hands or eyes.",
    hasDamageType: true,
    hasTarget: true,
    skillCompatible: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Super Strength",
    description: "Your physical strength far exceeds human limits.",
    hasDamageType: false,
    hasTarget: false,
    skillCompatible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Telekinesis",
    description: "You can move objects with your mind.",
    hasDamageType: false,
    hasTarget: true,
    skillCompatible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Power Sets data
export const samplePowerSets = [
  {
    id: 0,
    name: "Energy Controller",
    powers: ["Energy Blast", "Energy Shield", "Energy Absorption"],
    requiredArchetypes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Physical Powerhouse",
    powers: ["Super Strength", "Enhanced Durability", "Leaping"],
    requiredArchetypes: ["Bruiser"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Psychic",
    powers: ["Telepathy", "Telekinesis", "Mind Control"],
    requiredArchetypes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Power Modifiers data
export const samplePowerModifiers = [
  {
    id: 0,
    name: "Increased Range",
    description: "Extends the range of your power.",
    type: "Enhancement",
    bonus: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Increased Damage",
    description: "Augments the damage output of your power.",
    type: "Enhancement",
    bonus: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Limited Uses",
    description: "Restricts how often you can use your power.",
    type: "Limitation",
    bonus: -2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Analytics data
export const sampleAnalytics = {
  characterCreations: {
    total: 152,
    completed: 98,
    abandoned: 54,
    byMonth: [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 35 },
      { month: 'May', count: 65 }
    ]
  },
  popularChoices: {
    origins: [
      { name: 'Alien', count: 42 },
      { name: 'Experiment', count: 38 },
      { name: 'Augmented', count: 35 },
      { name: 'Mutant', count: 24 },
      { name: 'Supernatural', count: 13 }
    ],
    archetypes: [
      { name: 'Bruiser', count: 45 },
      { name: 'Speedster', count: 36 },
      { name: 'Mastermind', count: 28 },
      { name: 'Defender', count: 23 },
      { name: 'Blaster', count: 20 }
    ],
    powerSets: [
      { name: 'Energy Controller', count: 38 },
      { name: 'Physical Powerhouse', count: 35 },
      { name: 'Psychic', count: 29 },
      { name: 'Elemental', count: 27 },
      { name: 'Gadgeteer', count: 23 }
    ]
  }
};

/**
 * Gets the appropriate sample data based on the content type
 * @param contentType The type of game content to retrieve
 * @returns The corresponding sample data array
 */
export const getSampleData = (contentType: string): any[] => {
  switch (contentType) {
    case 'origins':
      return sampleOrigins;
    case 'archetypes':
      return sampleArchetypes;
    case 'skills':
    case 'skillSets':
    case 'skill-sets':
      return sampleSkillSets;
    case 'feats':
      return sampleFeats;
    case 'powers':
      return samplePowers;
    case 'powerSets':
    case 'power-sets':
      return samplePowerSets;
    case 'powerModifiers':
    case 'power-modifiers':
      return samplePowerModifiers;
    default:
      return [];
  }
};

/**
 * Gets a specific sample item by ID
 * @param contentType The type of game content to retrieve
 * @param id The ID of the item to retrieve
 * @returns The matching item or undefined
 */
export const getSampleItemById = (contentType: string, id: number): any => {
  const data = getSampleData(contentType);
  return data.find(item => item.id === id);
};
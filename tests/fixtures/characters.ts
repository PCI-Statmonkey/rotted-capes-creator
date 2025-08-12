export const baseCharacter = {
  abilityScores: { strength: 14, dexterity: 12 },
  selectedSkills: [],
  startingSkills: [],
  selectedSkillSets: [],
  skillSets: [],
  selectedFeats: [],
  powers: [],
  rank: 1,
  rankBonus: 1,
  burnoutThreshold: 10,
  currentBurnout: 0
};

export const customSkillSetCharacter = {
  ...baseCharacter,
  selectedSkillSets: [
    { name: 'Occultist', edges: ['Arcane'], source: 'custom' }
  ],
  skillSets: [{ name: 'Occultist', skills: [] }]
};

export const featGrantedSkillSetCharacter = {
  ...baseCharacter,
  selectedFeats: [
    { name: 'Wilderness Training', skillSetName: 'Scout' }
  ],
  selectedSkillSets: [
    { name: 'Scout', edges: [], source: 'Wilderness Training' }
  ],
  skillSets: [{ name: 'Scout', skills: [] }]
};

export const rankCapFixture = {
  rank: 1,
  rankBonus: 1,
  burnoutThreshold: 10,
  powers: [{ name: 'Flight', rank: 50, burnout: 5, uses: 1 }]
};

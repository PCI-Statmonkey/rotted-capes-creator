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
  skillSets: [{ name: 'Occultist', edges: ['Arcane'] }]
};

export const featGrantedSkillSetCharacter = {
  ...baseCharacter,
  selectedFeats: [
    { name: 'Wilderness Training', skillSetName: 'Scout' }
  ],
  selectedSkillSets: [
    { name: 'Scout', edges: [], source: 'Wilderness Training' }
  ],
  skillSets: [{ name: 'Scout', edges: [] }]
};

export const diminishedVitalityCharacter = {
  ...baseCharacter,
  complications: [
    {
      name: 'DiminishedVitality',
      type: 'DiminishedVitality',
      description: '',
      points: 5
    }
  ]
};

export const rankCapFixture = {
  rank: 1,
  rankBonus: 1,
  burnoutThreshold: 10,
  powers: [{ name: 'Flight', rank: 50, burnout: 5, uses: 1 }]
};

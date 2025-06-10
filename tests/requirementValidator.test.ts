import assert from 'assert';
import { parsePrerequisiteString, meetsPrerequisites, getMissingPrereqs } from '../client/src/utils/requirementValidator.ts';

const character = {
  abilityScores: { strength: 14, dexterity: 12 },
  selectedSkills: [],
  startingSkills: [],
  selectedSkillSets: [],
  skillSets: [],
  selectedFeats: []
};

assert.deepStrictEqual(
  parsePrerequisiteString('Str/Dex 13'),
  {
    type: 'compound',
    operator: 'or',
    requirements: [
      { type: 'ability', name: 'Str', value: 13 },
      { type: 'ability', name: 'Dex', value: 13 }
    ]
  }
);

assert.deepStrictEqual(
  parsePrerequisiteString('Str 13 Dex 15'),
  {
    type: 'compound',
    operator: 'and',
    requirements: [
      { type: 'ability', name: 'Str', value: 13 },
      { type: 'ability', name: 'Dex', value: 15 }
    ]
  }
);

assert.deepStrictEqual(
  parsePrerequisiteString('Str 13 or Dex 15'),
  {
    type: 'compound',
    operator: 'or',
    requirements: [
      { type: 'ability', name: 'Str', value: 13 },
      { type: 'ability', name: 'Dex', value: 15 }
    ]
  }
);

assert(
  meetsPrerequisites({ prerequisites: 'Str 13 or Dex 15' }, character)
);

assert(
  !meetsPrerequisites({ prerequisites: 'Str 13 Dex 15' }, character)
);

const missing = getMissingPrereqs({ prerequisites: 'Str 13 Dex 15' }, character);
assert(
  missing.some(r => r.type === 'ability' && r.name.toLowerCase() === 'dex' && r.value === 15)
);

console.log('All tests passed');

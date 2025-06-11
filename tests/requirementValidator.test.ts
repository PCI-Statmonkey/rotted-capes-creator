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

// Usage prerequisite should fail if usage count is too low
const usageChar = { ...character, usageCounts: { 'emulated power': 5 } };
assert(!meetsPrerequisites({ prerequisites: 'Used the emulated power 10 times' }, usageChar));

// Satisfy usage requirement
const usageCharOk = { ...character, usageCounts: { 'emulated power': 10 } };
assert(meetsPrerequisites({ prerequisites: 'Used the emulated power 10 times' }, usageCharOk));

// Power prerequisite checks owned powers
const powerChar = { ...character, powers: [] };
assert(!meetsPrerequisites({ prerequisites: 'Flight power' }, powerChar));

const powerCharOk = { ...character, powers: [{ name: 'Flight' }] };
assert(meetsPrerequisites({ prerequisites: 'Flight power' }, powerCharOk));

console.log('All tests passed');

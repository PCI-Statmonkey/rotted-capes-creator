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

// Maneuver prerequisite uses selected maneuver requirements
assert(
  meetsPrerequisites(
    { prerequisites: 'As per maneuver' },
    { ...character, maneuverRequirements: ['Strength 13'] }
  )
);

assert(
  !meetsPrerequisites(
    { prerequisites: 'As per maneuver' },
    { ...character, maneuverRequirements: ['Dexterity 15'] }
  )
);

const missingManeuver = getMissingPrereqs(
  { prerequisites: 'As per maneuver' },
  { ...character, maneuverRequirements: ['Dexterity 15'] }
);
assert(
  missingManeuver.some((r) => r.type === 'maneuverPrereq')
);

// Skill set and edge prerequisites
const charWithSet = {
  ...character,
  selectedSkillSets: [{ name: 'Occultist', edge: 'Arcane', source: 'Skill Focus' }],
  skillSets: [{ name: 'Occultist', skills: [] }],
};
assert(meetsPrerequisites({ prerequisites: 'Skill Set: Occultist' }, charWithSet));
assert(meetsPrerequisites({ prerequisites: 'Edge: Arcane' }, charWithSet));
const missingEdge = getMissingPrereqs(
  { prerequisites: 'Edge: Stealthy' },
  charWithSet
);
assert(missingEdge.some((r) => r.type === 'edge'));

console.log('All tests passed');

import assert from 'assert';
import { parsePrerequisiteString, meetsPrerequisites, getMissingPrereqs, parsePrerequisite } from '../client/src/utils/requirementValidator.ts';
import {
  baseCharacter as character,
  customSkillSetCharacter,
  featGrantedSkillSetCharacter,
  diminishedVitalityCharacter
} from './fixtures/characters.ts';

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

assert.deepStrictEqual(
  parsePrerequisiteString('Wisdom and Constitution of 13+'),
  {
    type: 'compound',
    operator: 'and',
    requirements: [
      { type: 'ability', name: 'Wisdom', value: 13 },
      { type: 'ability', name: 'Constitution', value: 13 }
    ]
  }
);

assert.deepStrictEqual(
  parsePrerequisite('Can not possess the diminished vitality weakness'),
  [{ type: 'cannot_have', name: 'diminished vitality' }]
);

assert(
  meetsPrerequisites({ prerequisites: 'Str 13 or Dex 15' }, character)
);

assert(
  !meetsPrerequisites({ prerequisites: 'Str 13 Dex 15' }, character)
);

assert(
  meetsPrerequisites(
    { prerequisites: 'Wisdom and Constitution of 13+' },
    { ...character, abilityScores: { wisdom: 13, constitution: 13 } }
  )
);

assert(
  !meetsPrerequisites(
    { prerequisites: 'Wisdom and Constitution of 13+' },
    { ...character, abilityScores: { wisdom: 12, constitution: 13 } }
  )
);

const missing = getMissingPrereqs({ prerequisites: 'Str 13 Dex 15' }, character);
assert(
  missing.hard.some(r => r.type === 'ability' && r.name.toLowerCase() === 'dex' && r.value === 15)
);

assert(
  meetsPrerequisites(
    { prerequisites: 'Can not possess the diminished vitality weakness' },
    character
  )
);

assert(
  !meetsPrerequisites(
    { prerequisites: 'Can not possess the diminished vitality weakness' },
    diminishedVitalityCharacter
  )
);

const missingWeakness = getMissingPrereqs(
  { prerequisites: 'Can not possess the diminished vitality weakness' },
  diminishedVitalityCharacter
);
assert(missingWeakness.hard.some(r => r.type === 'cannot_have'));

const noMissingWeakness = getMissingPrereqs(
  { prerequisites: 'Can not possess the diminished vitality weakness' },
  character
);
assert.equal(noMissingWeakness.hard.length, 0);

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
  missingManeuver.hard.some((r) => r.type === 'maneuverPrereq')
);

// Skill set and edge prerequisites using fixtures
assert(
  meetsPrerequisites(
    { prerequisites: 'Skill Set: Occultist' },
    customSkillSetCharacter
  )
);
assert(
  meetsPrerequisites(
    { prerequisites: 'Edge: Arcane' },
    customSkillSetCharacter
  )
);
const missingEdge = getMissingPrereqs(
  { prerequisites: 'Edge: Stealthy' },
  customSkillSetCharacter
);
assert(missingEdge.hard.some((r) => r.type === 'edge'));

// Soft requirement should not block feat selection
assert(
  meetsPrerequisites(
    { prerequisites: 'Editor-in-Chief approval' },
    character
  )
);
const missingApproval = getMissingPrereqs(
  { prerequisites: 'Editor-in-Chief approval' },
  character
);
assert(missingApproval.soft.some((r) => r.type === 'approval'));

// Feat-granted skill set
assert(
  meetsPrerequisites(
    { prerequisites: 'Skill Set: Scout' },
    featGrantedSkillSetCharacter
  )
);

console.log('requirementValidator tests passed');

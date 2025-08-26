import assert from 'assert';
import { meetsPrerequisites } from '../client/src/utils/requirementValidator.ts';
import { customSkillSetCharacter, featGrantedSkillSetCharacter } from './fixtures/characters.ts';
import { getRankCap } from '../client/src/utils/rank.ts';

// Custom skill set with edge
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

// Skill set granted by feat
assert(
  meetsPrerequisites(
    { prerequisites: 'Skill Set: Scout' },
    featGrantedSkillSetCharacter
  )
);

// Rank cap enforcement for skill ranks
const cap = getRankCap(2);
const enforced = Math.min(25, cap);
assert.strictEqual(enforced, cap);

console.log('skillSets tests passed');

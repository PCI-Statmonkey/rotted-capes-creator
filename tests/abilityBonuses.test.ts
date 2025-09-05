import assert from 'assert';
import { getOriginAbilityBonus, getArchetypeAbilityBonus } from '../client/src/utils/abilityBonuses.ts';

const character = {
  origin: 'Alien',
  archetype: 'Blaster'
} as any;

assert.strictEqual(getOriginAbilityBonus(character, 'strength'), 2);
assert.strictEqual(getOriginAbilityBonus(character, 'wisdom'), 0);

assert.strictEqual(getArchetypeAbilityBonus(character, 'dexterity'), 1);
assert.strictEqual(getArchetypeAbilityBonus(character, 'charisma'), 1);
assert.strictEqual(getArchetypeAbilityBonus(character, 'strength'), 0);

console.log('abilityBonuses tests passed');

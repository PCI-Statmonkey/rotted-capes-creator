import assert from 'assert';
import {
  getOriginAbilityBonus,
  getArchetypeAbilityBonus,
  getPowerAbilityBonus,
  getFeatAbilityBonus,
  getTotalAbilityBonus,
} from '../client/src/utils/abilityBonuses.ts';

const character = {
  origin: 'Alien',
  archetype: 'Blaster',
  powers: [{ name: 'Enhanced Ability Score (Strength)', score: 14 }],
  feats: [{ name: 'Acrobatic' }]
} as any;

assert.strictEqual(getOriginAbilityBonus(character, 'strength'), 2);
assert.strictEqual(getOriginAbilityBonus(character, 'wisdom'), 0);

assert.strictEqual(getArchetypeAbilityBonus(character, 'dexterity'), 1);
assert.strictEqual(getArchetypeAbilityBonus(character, 'charisma'), 1);
assert.strictEqual(getArchetypeAbilityBonus(character, 'strength'), 0);

assert.strictEqual(getPowerAbilityBonus(character, 'strength'), 2);
assert.strictEqual(getFeatAbilityBonus(character, 'dexterity'), 1);
assert.strictEqual(getTotalAbilityBonus(character, 'strength'), 4);
assert.strictEqual(getTotalAbilityBonus(character, 'dexterity'), 2);

console.log('abilityBonuses tests passed');

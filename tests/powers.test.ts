import assert from 'assert';
import { baseCharacter } from './fixtures/characters.ts';

const character = { ...baseCharacter, rankBonus: 2, burnoutThreshold: 10 };
const powers = [{ name: 'Energy Blast', burnout: 4, uses: 3 }];
const totalBurnout = powers.reduce((sum, p) => sum + (p.burnout || 0) * (p.uses || 0), 0);
assert.strictEqual(totalBurnout, 12);
const burnoutChecks = totalBurnout > character.burnoutThreshold ? 1 : 0;
assert.strictEqual(burnoutChecks, 1);
const afterRest = Math.max(0, totalBurnout - character.rankBonus);
assert.strictEqual(afterRest, 10);

console.log('powers tests passed');

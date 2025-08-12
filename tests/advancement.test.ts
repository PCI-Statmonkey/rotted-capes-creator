import assert from 'assert';
import { getRankCap } from '../client/src/utils/rank.ts';
import { rankCapFixture } from './fixtures/characters.ts';

// Initial rank cap
const cap = getRankCap(rankCapFixture.rank);
assert.strictEqual(cap, 20);
const cappedPowerRank = Math.min(rankCapFixture.powers[0].rank, cap);
assert.strictEqual(cappedPowerRank, cap);

// Rank advancement increases cap
const newRank = 5;
const newCap = getRankCap(newRank);
assert.strictEqual(newCap, 36);

console.log('advancement tests passed');

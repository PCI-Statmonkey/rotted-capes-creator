import assert from 'assert';

const powers = [{ name: 'Energy Blast' }];
const totalBurnout = powers.reduce((sum, p) => sum + (p.burnout || 0), 0);
assert.strictEqual(totalBurnout, 0);

console.log('powers tests passed');

import assert from 'assert';
import { displayFeatName } from '../client/src/lib/utils.ts';

assert.strictEqual(
  displayFeatName('Energy Affinity [power feat]'),
  'Energy Affinity (power feat)'
);

assert.strictEqual(
  displayFeatName('Energy Affinity \\\\[power feat\\\\]'),
  'Energy Affinity (power feat)'
);

assert.strictEqual(
  displayFeatName('Energy Affinity /[power feat/]'),
  'Energy Affinity (power feat)'
);

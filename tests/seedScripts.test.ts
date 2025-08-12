import assert from 'assert';
import { spawnSync } from 'child_process';

const scripts = [
  'scripts/seed.ts',
  'scripts/seedManeuvers.ts',
  'server/db/seed/seedGameContent.ts'
];

for (const script of scripts) {
  const res = spawnSync('node', ['--check', script], { encoding: 'utf8' });
  assert.strictEqual(res.status, 0, `${script} failed syntax check: ${res.stderr}`);
}

console.log('seed script syntax tests passed');

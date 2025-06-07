import { existsSync } from 'fs';

if (!existsSync('node_modules')) {
  console.warn('node_modules directory missing. Run "npm install" before "npm run check".');
}

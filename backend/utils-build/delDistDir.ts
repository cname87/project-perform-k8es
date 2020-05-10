/**
 * Utility to delete the dist directory
 *
 * Used in package.json: "npm run <path>delDistDir.ts
 *
 */

import fs from 'fs';
import rimraf from 'rimraf';
import { join } from 'path';

console.log('Deleting dist directory');

/* the path to the dist directory is relative to this directory */
const distPath = join(__dirname, '../dist/');
console.log(`Deleting: ${distPath}`);

if (!fs.existsSync(distPath)) {
  console.error('WARNING: dist directory not found');
}

rimraf.sync(distPath, { maxBusyTries: 100 });

if (fs.existsSync(distPath)) {
  console.error('ERROR: dist directory not deleted');
  process.exit(1);
} else {
  console.log(`The directory ${distPath} is deleted or was not found`);
}

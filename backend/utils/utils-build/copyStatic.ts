/**
 * Utility to copy files in static folders to the dist directory.
 *
 * Usage:
 * Used in package.com.
 * The directory containing the static files is passed in as a parameter.
 * The dist directory is passed in as a parameter.
 * package.com script: "npm run copyEnv.ts <pathToEnvFile> <pathToDistDir>".
 *
 * Both paths are relative to the package.json directory.
 *
 * <pathToDistDir> must end in /dist.
 *
 */

import * as appRootObject from 'app-root-path';
// import fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';

const appRoot = appRootObject.toString();

/* create path to the static files */
const staticPath = path.join(appRoot, process.argv[2]);

/* create path to dist directory from passed in parameter */
const distPath = path.join(appRoot, process.argv[3]);

// /* create path to the created file */
// const staticPathDist = path.join(distPath, process.argv[2]);

// if (!fs.existsSync(staticPath)) {
//   console.error('ERROR: env file not found');
//   process.exit(1);
// }

// if (process.argv[3].slice(-5) !== '/dist') {
//   console.error('dist directory not provided');
//   process.exit(1);
// }

// if (!fs.existsSync(distPath)) {
//   console.error('ERROR: dist directory not found');
//   process.exit(1);
// }

// shell.mkdir(distPath);
shell.cp('-R', staticPath, distPath);

// if (!fs.existsSync(staticPathDist)) {
//   console.error('ERROR: env file not found in /dist');
//   process.exit(1);
// }
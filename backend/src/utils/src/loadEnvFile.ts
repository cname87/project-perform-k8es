/**
 * Utility to import the .env file into process.env variables.
 *
 * This should be called as the first line to set configuration parameters before they might be needed.
 * The .env files must be called .envDevelopment & .envStaging, and must be in a directory above this directory.
 *
 * Which .env file imported is dependent on the value of process.env.NODE_ENV.
 * 1. NODE_ENV=staging sets a staging configuration - an e2e test stage in GCP Cloud Build sets NODE_ENV=staging,
 * 2. NODE_ENV=development sets a development configuration - NODE_ENV must be set via a VSCode launch configuration or otherwise.
 * 3. When being run from a Kubernetes cluster the production configuration parameters are set via a secret and configmap yaml file, including setting NODE_ENV=production and thus there is no .envProduction file.
 * - If none of the above three apply then an error will be thrown.
 *
 * Note that any environment variables set before loading an .env file are never overwritten.
 * If NODE_ENV === 'production' then key parameters are checked and warnings are printed if they are not set to match a final production set up.
 * If NODE_ENV does not equal 'production' and the 'DB_MODE' parameter says that the production database is in use then an error is thrown.
 *
 */
import dotenv from 'dotenv';
import findup from 'find-up';

switch (process.env.NODE_ENV) {
  case 'staging': {
    const envPath = findup.sync('.envStaging', { cwd: __dirname })!;
    /* Load .env file */
    dotenv.config({ path: envPath });

    break;
  }
  /* If not set it defaults to the development configuration */
  case 'development': {
    const envPath = findup.sync('.envDevelopment', { cwd: __dirname })!;
    /* Load .env file */
    dotenv.config({ path: envPath });
    break;
  }
}

/* set up debug function after DEBUG variable is set */
import { setupDebug } from './debugOutput';

/* output a header */
setupDebug(__filename);

/* test that DB_HOST has been set, and abort if not */
if (!process.env.DB_HOST) {
  console.error('An .env file was not imported => aborting startup');
  throw new Error('An .env file was not imported => aborting startup');
}

/* Warn when in production on key parameters */
if (process.env.NODE_ENV === 'production') {
  if (process.env.DEBUG) {
    console.warn('*** NOTE: DEBUG parameter is set');
  }
  if (process.env.TEST_PATHS) {
    console.warn('*** NOTE: TEST_PATHS parameter is set');
  }
  if (process.env.DB_MODE !== 'production') {
    console.warn('*** NOTE: Production database NOT in use');
  }
}

/* Throw an error when not in production mode and the production database is in use */
if (process.env.NODE_ENV !== 'production') {
  if (process.env.DB_MODE === 'production') {
    throw new Error('Production database in use in a non-production set up');
  }
}

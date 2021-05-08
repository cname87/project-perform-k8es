/* import configuration parameters into process.env */
import '../utils/src/loadEnvFile';

/* file header */
import { setupDebug } from '../utils/src/debugOutput';

/* external dependencies */
import 'mocha';

/* set DB_MODE to 'test' (or anything but 'production') to ensure the test database is loaded */
process.env.DB_MODE = 'test';
setupDebug(__filename);

/* Note: All test modules that need a server use app.js to start the server (parhaps on each 'it' function) and then close it before they exit. */

let originalTestPaths: string | undefined;
before('Before all tests', async () => {
  /* open testServer routes */
  originalTestPaths = process.env.TEST_PATHS;
  process.env.TEST_PATHS = 'true';
});

let beforeCount = 0;
beforeEach('Before each test', () => {
  /* count listeners */
  beforeCount = process.listenerCount('uncaughtException');
});

afterEach('After each test', () => {
  const afterCount = process.listenerCount('uncaughtException');
  /* close listeners */
  const arrayListeners = process.listeners('uncaughtException');
  if (afterCount > beforeCount) {
    process.removeListener(
      'uncaughtException',
      arrayListeners[arrayListeners.length - 1],
    );
  }
});

after('After all tests', async () => {
  /* reset testServer routes setting */
  process.env.TEST_PATHS = originalTestPaths;
});

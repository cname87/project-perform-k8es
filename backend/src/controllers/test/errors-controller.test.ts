/**
 * Runs a set of tests (under one mocha describe test) fired by client-side
 * scripts.
 *
 * The tests test all error handler functionality.
 *
 * Operation:
 *  - This module calls a url which loads a browser script which sends events that trigger the tests below and tests the response - see errors-client-test.js.
 * - Note: To control which tests are run edit the errors-client-test.js file.
 * - The tests below result in the fail controller being called, i.e. the fail controller actually executes the error actions, including sending responses to the browser and triggering errors.
 * - Note that the error handler will operate in a test mode and will trap errors thrown in the fail contoller and not shut the server.
 * - This module tests the server response.
 * - Refer to the fail controller module for detail on the individual tests.
 * - Note that many of the error tests are not very useful i.e. they simply test mocked handlers e.g. an unhandled rejection is simply trapped in the test module.
 *
 * To run:
 *
 * - Run this as a Mocha test file.
 *
 * - This calls a url which runs client-side scripts in the browser.  These trigger events that cause the tests below to be run.
 *
 * - Note that the client-side scripts are called automatically via a chrome call below only an environment variable is so configured.  Disable this if you want to run the browser via a VSCode launch configuration (e.g. if you want debug breakpoints to be set).

 */

/* import configuration parameters into process.env first */
import '../../utils/src/loadEnvFile';

import { setupDebug } from '../../utils/src/debugOutput';

/* set up mocha, sinon & chai */
import chai from 'chai';
import 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import path from 'path';
/* use proxyquire for app.js module loading */
import proxyquire from 'proxyquire';
import { EventEmitter } from 'events';
import puppeteer from 'puppeteer';

/* internal dependencies */
import * as errorHandlerModule from '../../handlers/error-handlers';

const { modulename, debug } = setupDebug(__filename);
chai.use(sinonChai);
const { expect } = chai;
sinon.assert.expose(chai.assert, {
  prefix: '',
});

/* variables */
const appPath = '../../app';
/* url that initiates the client-fired tests */
const fireTestUrl = `${process.env.HOST}:${process.env.PORT}/testServer/errors-loadMocha.html`;
const browserDelay = process.env.BROWSER_DELAY
  ? parseInt(process.env.BROWSER_DELAY, 10)
  : 0;
/* event names */
const appRunApp = 'appRunApp';
const appSigint = 'appSigint';
const handlersRaiseEvent = 'handlersRaiseEvent';

describe('Server Errors', () => {
  debug(`Running ${modulename} describe - Server Errors`);

  /* shared variables */
  let app: Perform.IServerIndex;
  let eventEmitter: EventEmitter;
  let spyConsoleError: sinon.SinonSpy<[any?, ...any[]], void>;
  let spyDumpError: sinon.SinonSpy<any>;
  let spyErrorHandlerDebug: sinon.SinonSpy<any>;
  let stubProcessExit: sinon.SinonStub<[number?], never>;

  /* awaits that server app.ts has run and fired the completion event */
  const serverIndexStart = (): Promise<Perform.IServerIndex> => {
    debug(`${modulename}: awaiting server up`);
    return new Promise(async (resolve, reject) => {
      /* use proxyquire in case app.js already required */
      const { appVars: serverIndex } = proxyquire(appPath, {});
      /* Note: You need app.ts to define 'event' before the db setup call as the async db set up (which cannot easily be awaited) means the next line is executed before the db is up ND 'app.event' needs to be defined by then */
      serverIndex.appLocals.event.once(
        appRunApp,
        (arg: { message: string }) => {
          if (arg.message === 'Server running 0') {
            debug(
              `${modulename}: server running message caught: ${arg.message}`,
            );
            resolve(serverIndex);
          } else {
            debug(`${modulename}: server running error caught: ${arg.message}`);
            reject(
              new Error(`Server running rejected message: ${arg.message}`),
            );
          }
        },
      );
    });
  };

  /* run app.js and set up all spies */
  const runServerAndSetupSpies = async () => {
    /* spy on console.error */
    /* NOTE: If a dumpError instance is created before this by another module then the dumpError console.error calls will not be spied => do not count exact calls but use greaterThan */
    spyConsoleError = sinon.spy(console, 'error');
    /* run server app.js */
    app = await serverIndexStart();
    /* Now define all objects that are dependent on app being started */
    spyDumpError = sinon.spy(app.appLocals, 'dumpError');
    /* remove all 'unhandledRejection' listeners, including the one created in in the main server app.js module, as it would cause the process to exit */
    process.removeAllListeners('unhandledRejection');
    /* handle the unhandledRejection so it does not crash the server */
    process.on('unhandledRejection', (reason, _promise) => {
      console.error(`Unhandled Rejection with reason: ${reason}`);
    });
    eventEmitter = app.appLocals.event;

    /* process.exit will not be called in a specific test below */
    stubProcessExit = sinon.stub(process, 'exit');
    /* stub error handling debug function so you can capture error messages */
    spyErrorHandlerDebug = sinon.spy(errorHandlerModule, 'debug');
  };

  /* awaits that app.ts has shut and fired the completion event */
  const serverIndexShutdown = (serverIndex: Perform.IServerIndex) => {
    debug(`${modulename}: awaiting server shutdown`);
    return new Promise((resolve, reject): void => {
      serverIndex.appLocals.event.once(appSigint, (arg) => {
        if (arg.message === 'Server exit 0') {
          debug(`${modulename}: server close message caught: ${arg.message}`);
          resolve('pass');
        } else {
          debug(`${modulename}: server close error caught: ${arg.message}`);
          reject(new Error(`Server close rejected message: ${arg.message}`));
        }
      });
      /* fires sigint which fires the above event */
      serverIndex.sigint();
    });
  };

  before('set up spies', async () => {
    debug(`Running ${modulename} before - set up spies`);
    await runServerAndSetupSpies();
  });

  beforeEach('Reset spies', () => {
    sinon.resetHistory();
  });

  afterEach('Reset spies', async () => {
    sinon.resetHistory();
  });

  after('after', async () => {
    debug(`Running ${modulename} after - close and reset`);

    debug('Shutting app.js');
    await serverIndexShutdown(app);
    expect(spyConsoleError.notCalled).to.be.true;
    expect(spyDumpError.notCalled).to.be.true;
    sinon.restore();
  });

  it('tests browser-fired server functionality', async () => {
    debug(
      `Running ${modulename} it - tests browser-fired server functionality`,
    );

    /* set true when browser tests have run */
    let endTestCalled = false;
    await new Promise((resolve, reject) => {
      /* chrome instance that is started */
      let browserInstance: puppeteer.Browser;

      const browserEventsCallback = (arg: { message: string }) => {
        /* try needed as errors thrown within this function will be seen as a server error and not fail the mocha test - a reject causes a test case fail */
        try {
          switch (arg.message) {
            case 'Start tests':
            case '404 test start':
            case 'Coffee test start':
            case 'Sent test start':
            case 'Trap-503 test start':
            case 'Async-handled test start':
            case 'Error test start':
            case 'Async test start':
            case 'Crash test start':
            case 'Return 404 test start':
            case 'Check server up':
              break;
            case '404 test end':
            case 'Coffee test end':
            case 'Return 404 test end':
            case 'Trap-503 test end':
              expect(spyConsoleError.callCount).to.be.greaterThan(1);
              expect(spyDumpError.callCount).to.be.greaterThan(0);
              sinon.resetHistory();
              break;
            case 'Sent test end':
              /* debug message informs on header already sent */
              expect(
                spyErrorHandlerDebug.calledWith(
                  `${path.sep}error-handlers.js: not sending a client response as headers already sent`,
                ),
              ).to.be.true;
              expect(spyDumpError.callCount).to.eql(1);
              sinon.resetHistory();
              break;
            case 'Async-handled test end':
              /* 2 tests ran */
              expect(spyConsoleError.callCount).to.be.greaterThan(2);
              expect(spyDumpError.callCount).to.be.greaterThan(0);
              sinon.resetHistory();
              break;
            case 'Error test end':
              /* debug message reports that error not thrown as in test */
              expect(
                spyErrorHandlerDebug.calledWith(
                  `${path.sep}error-handlers.js: *** In test mode => blocking an error from been thrown ***`,
                ),
              ).to.be.true;
              sinon.resetHistory();
              break;
            case 'Async test end':
              /* the unhandled rejection will cause an error to be thrown which would shut the server but it is caught by a process 'unhandledRejection' handler above which calls console.error */
              expect(spyConsoleError.callCount).to.eql(1);
              sinon.resetHistory();
              break;
            case 'Crash test end':
              expect(stubProcessExit.callCount).to.eql(1);
              sinon.resetHistory();
              break;
            case 'End tests':
              expect(spyConsoleError.notCalled).to.be.true;
              expect(spyDumpError.notCalled).to.be.true;
              endTestCalled = true;
              sinon.resetHistory();
              break;
            default:
              reject(new Error('should not reach this point'));
          }
        } catch (err) {
          debug(`${modulename}: test fail => exit test`);
          reject(err);
        }

        /* only close when browser tests complete */
        if (endTestCalled) {
          eventEmitter.removeListener(
            handlersRaiseEvent,
            browserEventsCallback,
          );
          /* close down chrome if configured to start automatically, i.e. not disabled */
          if (process.env.DISABLE_CHROME !== 'true') {
            setTimeout(() => {
              browserInstance.close();
              /* only resolve when chrome closed */
              resolve('pass');
            }, browserDelay);
          } else {
            resolve('pass');
          }
        }
      };

      /* all browser events received here */
      eventEmitter.on(handlersRaiseEvent, browserEventsCallback);

      /* start chrome on mocha test page if so configured */
      if (process.env.DISABLE_CHROME !== 'true') {
        (async () => {
          browserInstance = await puppeteer.launch({
            headless: process.env.DISABLE_HEADLESS !== 'true',
            defaultViewport: {
              width: 800,
              height: 800,
            },
            args: [
              '--incognito',
              '--start-maximized',
              '--new-window',
              '--disable-popup-blocking',
              '--no-sandbox',
            ],
          });
          const page = await browserInstance.newPage();
          await page.goto(fireTestUrl);
        })();
      }
    });
  });
});

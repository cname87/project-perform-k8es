/**
 * This module starts a http server.
 * It has a dependency on an imported server object.
 * It loads the started server in an input array parameter, (so the server can be closed later).
 */

/* external dependencies */
import express from 'express';
import http from 'http';
import winston from 'winston';
import { Server } from './server';
import { setupDebug } from '../utils/src/debugOutput';

const { modulename, debug } = setupDebug(__filename);

type TStartServer = (
  app: express.Application,
  servers: Server[],
  logger: winston.Logger,
  dumpError: Perform.DumpErrorFunction,
) => Promise<void>;

/**
 * Starts the http server.
 * @param
 * - app: The express app object.
 * - servers: Used to return the started server object.
 * - logger: Logging service.
 * - dumpError: Error logging service.
 * @returns
 * Void
 * @throws
 * Throws an error if an error occurs during the server listen request.
 */

const startServer: TStartServer = async (
  app: express.Application,
  servers: Server[],
  logger: winston.Logger,
  dumpError: Perform.DumpErrorFunction,
) => {
  debug(`${modulename}: running startServer`);

  /**
   * This function sets up the required http server listening on the appropriate port.
   */
  async function connectServer(
    svrType: typeof http,
    svrName: string,
    svrOptions: http.ServerOptions,
    expressApp: http.RequestListener,
    svrPort: number,
    listenRetries: number,
    listenTimeout: number,
  ) {
    const server = new Server();
    server.configureServer(svrName, logger, dumpError);
    server.setupServer(svrType, svrOptions, expressApp);
    try {
      await server.listenServer(svrPort, listenRetries, listenTimeout);
    } catch (err) {
      logger.error(`${modulename}: server listen error reported`);
      dumpError(err);
      throw err;
    }

    /* store created server */
    servers.push(server);
  }

  const serverType = http;
  const serverName = 'http';
  const serverOptions = {};
  const serverPort = +process.env.PORT!;

  /* start the server */
  await connectServer(
    serverType,
    serverName,
    serverOptions,
    app,
    serverPort,
    +process.env.SVR_LISTEN_TRIES!,
    +process.env.SVR_LISTEN_TIMEOUT!,
  );

  debug(`${modulename}: http server up and listening`);
};

/* Export the start server function */
export { startServer };

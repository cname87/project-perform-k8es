'use strict';

/**
 * This module starts a http(s) server.
 * It relies on a server object with methods in a separate module.
 * It returns the servers started in a property of the input
 * parameter, (so they can be closed later).
 */

const modulename = __filename.slice(__filename.lastIndexOf('\\'));
import debugFunction from 'debug';
const debug = debugFunction('PP_' + modulename);
debug(`Starting ${modulename}`);

/* external dependencies */
import express from 'express';
import secure from 'express-force-ssl';
import fs from 'fs';
import http from 'http';
import https from 'https';

/**
 * Starts the http(s) server.
 * @param app
 * The express app object
 * app.locals holds other set up objects including the array used to store
 * the https(s) servers.
 * @returns
 * Void
 * @throws
 * Throws an error if an error occurs during the server listen request.
 */

export async function startServer(app: express.Application) {
  debug(modulename + ': running startServer');

  const objects = app.locals;
  const config = app.locals.config;
  const logger = app.locals.logger;
  const dumpError = app.locals.dumpError;

  /* import serverops module */
  const { Server } = config.SERVER;

  /* server connection utility function */
  async function connectServer(
    svrType: any,
    svrName: string,
    svrOptions: object,
    expressApp: express.Application,
    svrPort: number,
    listenRetries: number,
    listenTimeout: number,
  ) {
    const server: any = new Server();
    server.configServer(svrName, logger, dumpError);
    server.setupServer(svrType, svrOptions, expressApp);
    try {
      await server.listenServer(svrPort, listenRetries, listenTimeout);
    } catch (err) {
      logger.error(modulename + ': server listen error reported');
      dumpError(err);
      throw err;
    }

    /* store created server in objects */
    objects.servers.push(server);
  }

  /* set up http server connection variables */
  let serverType: any = http;
  let serverName = 'http';
  let serverOptions = {};
  let serverPort = 80;

  /* redirects default port 80 traffic to the https port */
  if (config.HTTPS_ON) {
    /* set option for express-force-ssl */
    app.set('forceSSLOptions', {
      httpsPort: config.PORT,
    });
    /* force http redirection */
    app.use(secure);

    /* starts the http server which is redirected to https port*/
    await connectServer(
      serverType,
      serverName,
      serverOptions,
      app,
      serverPort,
      config.SVR_LISTEN_TRIES,
      config.SVR_LISTEN_TIMEOUT,
    );

    /* overwrite default http server settings */
    serverType = https;
    serverName = 'https';
    // ssl credentials
    serverOptions = {
      cert: fs.readFileSync(config.HTTPS_CERT),
      key: fs.readFileSync(config.HTTPS_KEY),
    };
    serverPort = config.PORT;
  }

  /* start the http or https server */
  await connectServer(
    serverType,
    serverName,
    serverOptions,
    app,
    serverPort,
    config.SVR_LISTEN_TRIES,
    config.SVR_LISTEN_TIMEOUT,
  );

  debug(modulename + ': https(s) server up and listening');
}
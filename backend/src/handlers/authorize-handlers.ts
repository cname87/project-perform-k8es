/**
 * Authorizes the user and request combination.
 */

import { Request, Response, NextFunction } from 'express';
import expressJwtPermissions from 'express-jwt-permissions';
import { setupDebug } from '../utils/src/debugOutput';

const { modulename, debug } = setupDebug(__filename);

/**
 * Authorizes the user & request combination.
 * Case 1:
 * It allows the request only when the user has permission to access the configured database, i.e. the 'test' Vs the production 'perform' database.
 */
export const authorizeHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  debug(`${modulename}: running authorizeHandler`);

  /* the user will need 'all:performDB' permission if the production database is in use, otherwise 'all:testDB' is required */
  const requiredPermission =
    process.env.DB_MODE === 'production' ? 'all:performDB' : 'all:testDB';

  /* server requests use a grant type of client-credentials and the permissions are contained in auth.scope or auth.permissions */
  const permissionsProperty =
    (req.auth! as any).gty === 'client-credentials' ? 'scope' : 'permissions';

  /* this will call next(err) on error => catch with an error handler next */
  const checkPermissions = expressJwtPermissions({
    requestProperty: 'auth',
    permissionsProperty,
  }).check(requiredPermission);

  checkPermissions(req, res, next);
};

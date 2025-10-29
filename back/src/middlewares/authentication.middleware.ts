import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../helpers/login.helpers.js';
import { UserSession } from '../interfaces.js';
import { ENV } from '../core/index.js';

export const AUTH = {
  KEY: 'authorization',
  SCHEMA: 'Bearer',
};

declare global {
  namespace Express {
    interface Request {
      userSession?: UserSession;
    }
  }
}

export const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [, token] = req.cookies[AUTH.KEY]?.split(' ') || [];
    const userSession = await verifyJWT<UserSession>(token, ENV.AUTH_SECRET);
    req.userSession = userSession;
    next();
  } catch (error) {
    res.sendStatus(401);
  }
};
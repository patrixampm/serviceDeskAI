import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { mapObjectIdToString } from '../helpers/mapper.helpers.js';
import { ENV } from '../core/index.js';
import { AUTH } from '../middlewares/authentication.middleware.js';
import { dbRepository } from '../dals/user.repository.js';
import { UserSession } from '../interfaces.js';

export const securityApi = Router();

securityApi
  .post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await dbRepository.getUserByEmailAndPassword(
        email,
        password
      );

      if (user) {
        const userSession: UserSession = {
          id: mapObjectIdToString(user._id),
          role: user.role,
        };
        const token = jwt.sign(userSession, ENV.AUTH_SECRET, {
          expiresIn: '1d',
          algorithm: 'HS256',
        });

        res.cookie(AUTH.KEY, `${AUTH.SCHEMA} ${token}`, {
          httpOnly: true,
        });
        res.sendStatus(204);
      } else {
        res.clearCookie(AUTH.KEY);
        res.sendStatus(401);
      }
    } catch (error) {
      next(error);
    }
  })
  .post('/logout', async (req, res, next) => {
    try {
      res.clearCookie(AUTH.KEY);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });
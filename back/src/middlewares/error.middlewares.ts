import { ErrorRequestHandler } from 'express';

export const logErrorRequestMiddleware: ErrorRequestHandler = async (
  error,
  req,
  res,
  next
) => {
  console.error(error);
  res.sendStatus(500);
};

const root = '/api';

export const API_ROUTES = {
  root,
  security: `${root}/security`,
  standard_user: `${root}/standard-user`,
  issues: `${root}/issues`,
  admin: `${root}/admin`,
  chat: `${root}/chat`,
};

export const ENV = {
  PORT: process.env.PORT!,
  MONGODB_URI: process.env.MONGODB_URI!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
};

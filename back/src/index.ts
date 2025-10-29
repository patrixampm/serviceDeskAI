import './load-env.js';
import express from 'express';
import { connect } from '../../db/src/db.server.js';
import { logErrorRequestMiddleware } from './middlewares/error.middlewares.js';
import { authenticationMiddleware } from './middlewares/authentication.middleware.js';
import { API_ROUTES, ENV } from './core/index.js';
import { securityApi } from './pods/security.rest-api.js';
import { standardUserApi } from './pods/user.rest-api.js';
import { issueApi } from './pods/issue.rest-api.js';
import { adminApi } from './pods/admin.rest-api.js';
import { chatApi } from './pods/chat.rest-api.js';
import { createAPIServer } from "./server.js";

const app = createAPIServer();

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

app.use(API_ROUTES.security, securityApi);
app.use(API_ROUTES.standard_user, authenticationMiddleware, standardUserApi);
app.use(API_ROUTES.issues, authenticationMiddleware, issueApi);
app.use(API_ROUTES.admin, authenticationMiddleware, adminApi);
app.use(API_ROUTES.chat, authenticationMiddleware, chatApi);

app.use(logErrorRequestMiddleware);

app.listen(ENV.PORT, async () => {
	await connect(ENV.MONGODB_URI);
	console.log('MongoDB mode');
	console.log(`API server is running on port ${ENV.PORT}`);
});

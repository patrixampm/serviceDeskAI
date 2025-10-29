import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

export const createAPIServer = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(cors({ 
		credentials: true, 
		origin: ['http://localhost:5173', 'http://localhost:8080']
	}));

	return app;
}


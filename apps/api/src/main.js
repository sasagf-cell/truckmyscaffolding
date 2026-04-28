import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';
import emailJobs from './jobs/emailJobs.js';
import { runMigrations } from './utils/migrations.js';

const app = express();

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
	logger.info('Interrupted');
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received');

	await new Promise(resolve => setTimeout(resolve, 3000));

	logger.info('Exiting');
	process.exit();
});

app.use(helmet());

const allowedOrigins = [
	process.env.CORS_ORIGIN,
	'https://trackmyscaffolding.com',
	'https://www.trackmyscaffolding.com',
	'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		callback(new Error(`CORS blocked: ${origin}`));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/', routes());

app.use(errorMiddleware);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, async () => {
	logger.info(`🚀 API Server running on http://localhost:${port}`);

	// Run DB migrations (idempotent — safe on every startup)
	try {
		await runMigrations();
		logger.info('Migrations complete');
	} catch (err) {
		logger.error('Migration error:', err?.message || err);
	}

	// Initialize email system
	logger.info('Email system initialized');

	// Start scheduled email jobs
	emailJobs.startDay3FollowupJob();
	logger.info('Day 3 Follow-up job started');

	emailJobs.startPendingReminderJob();
	logger.info('Pending Reminder job started');

	emailJobs.startMonthlyReportJob();
	logger.info('Monthly Report job started');
});

export default app;

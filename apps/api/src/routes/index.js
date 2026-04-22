import { Router } from 'express';
import healthCheck from './health-check.js';
import authRouter from './auth.js';
import projectsRouter from './projects.js';
import projectsPatchRouter from './projects-patch.js';
import aiRouter from './ai.js';
import stripeRouter from './stripe.js';
import inventoryRouter from './inventory.js';
import reportsRouter from './reports.js';
import usersRouter from './users.js';
import billingRouter from './billing.js';
import emailRouter from './email.js';
import workerHoursRouter from './worker-hours.js';
import qrRouter from './qr.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/auth', authRouter);
  router.use('/projects', projectsRouter);
  router.patch('/projects/:projectId', projectsPatchRouter);
  router.use('/ai', aiRouter);
  router.use('/stripe', stripeRouter);
  router.use('/inventory', inventoryRouter);
  router.use('/reports', reportsRouter);
  router.use('/users', usersRouter);
  router.use('/billing', billingRouter);
  router.use('/email', emailRouter);
  router.use('/worker-hours', workerHoursRouter);
  router.use('/api', qrRouter);

  return router;
};

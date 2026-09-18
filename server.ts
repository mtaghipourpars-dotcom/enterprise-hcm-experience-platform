// ============================================================================
// Enterprise HCM Experience Platform - Main Express Server Entry Point
// Binds to port 3000, host 0.0.0.0, initializes SQLite database and mounts
// 8-tier traceable domain routes with Vite integration
// ============================================================================

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { initDatabase } from './server/db/database';
import { seedDatabase } from './server/db/seed';

import { authMiddleware } from './server/middleware/auth';
import { auditMiddleware } from './server/middleware/audit';
import { errorHandler } from './server/middleware/error-handler';

import employeeRouter from './server/routes/employee';
import organizationRouter from './server/routes/organization';
import timeRouter from './server/routes/time';
import payrollRouter from './server/routes/payroll';
import trainingRouter from './server/routes/training';
import talentRouter from './server/routes/talent';
import managerRouter from './server/routes/manager';
import analyticsRouter from './server/routes/analytics';
import workflowRouter from './server/routes/workflow';
import systemRouter from './server/routes/system';

const PORT = 3000;

async function startServer() {
  const app = express();

  // 1. Initialize SQLite database & seed initial HCM schema
  console.log('[HCM Backend] Initializing in-memory SQLite database...');
  await initDatabase();
  await seedDatabase();
  console.log('[HCM Backend] Database initialized and seeded successfully.');

  // 2. Global middlewares
  app.use(express.json());
  app.use(authMiddleware);
  app.use(auditMiddleware);

  // 3. Mount domain API routes
  app.use('/api/employee', employeeRouter);
  app.use('/api/organization', organizationRouter);
  app.use('/api/time', timeRouter);
  app.use('/api/payroll', payrollRouter);
  app.use('/api/training', trainingRouter);
  app.use('/api/talent', talentRouter);
  app.use('/api/manager', managerRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/workflow', workflowRouter);
  app.use('/api', systemRouter);

  // Central error handler
  app.use(errorHandler);

  // 4. Vite middleware for frontend client integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enterprise HCM Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[HCM Backend] Fatal server initialization failure:', err);
  process.exit(1);
});

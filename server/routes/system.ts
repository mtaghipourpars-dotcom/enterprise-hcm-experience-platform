// ============================================================================
// Enterprise HCM Experience Platform - System & Catalog Introspection Routes
// Services: Health, Audit Log, User Context, and Master Service Catalog
// ============================================================================

import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/database';
import { ApiResponse } from '../types/api';
import fs from 'fs';
import path from 'path';

const router = Router();

// ----------------------------------------------------------------------------
// Health Check
// ----------------------------------------------------------------------------
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbTest = await queryOne('SELECT 1 as alive');
    res.json({
      status: 'ok',
      database: dbTest?.alive === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Current User & Active Persona
// ----------------------------------------------------------------------------
router.get('/auth/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user || null
  });
});

// ----------------------------------------------------------------------------
// Service Catalog Master Listing (8-tier Traceability)
// ----------------------------------------------------------------------------
router.get('/catalog', async (req: Request, res: Response) => {
  try {
    const catalogPath = path.join(process.cwd(), 'assets', 'service-catalog', 'service-catalog.master.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const json = JSON.parse(raw);
      res.json({
        success: true,
        catalog: json
      });
      return;
    }

    res.status(404).json({
      success: false,
      error: { code: 'CATALOG_NOT_FOUND', message: 'Master catalog file not found' }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Centralized Audit Log Queries
// ----------------------------------------------------------------------------
router.get('/audit', async (req: Request, res: Response) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const serviceCode = req.query.serviceCode as string;

  let sql = 'SELECT * FROM audit_log';
  const params: any[] = [];

  if (serviceCode) {
    sql += ' WHERE service_code = ?';
    params.push(serviceCode);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  const logs = await query<any>(sql, params);

  res.json({
    success: true,
    count: logs.length,
    data: logs
  });
});

export default router;

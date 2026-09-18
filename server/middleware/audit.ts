// ============================================================================
// Enterprise HCM Experience Platform - Centralized Audit Logging Middleware
// Captures actor, service lineage, endpoint mutation, timing & compliance events
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { run } from '../db/database';
import { ActionType, AuditStatus } from '../types/api';

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const durationMs = Date.now() - startTime;
      const statusCode = res.statusCode;

      let auditStatus: AuditStatus = 'SUCCESS';
      if (statusCode >= 400 && statusCode < 500) {
        auditStatus = statusCode === 401 || statusCode === 403 ? 'DENIED' : 'FAILURE';
      } else if (statusCode >= 500) {
        auditStatus = 'FAILURE';
      }

      // Determine action
      let action: ActionType = 'READ';
      if (req.method === 'POST') action = 'WRITE';
      else if (req.method === 'PUT' || req.method === 'PATCH') action = 'WRITE';
      else if (req.path.includes('/who-is-who') || req.path.includes('/courses')) action = 'SEARCH';
      else if (req.path.includes('/inbox') || req.path.includes('/approval')) action = 'APPROVE';
      else if (req.path.includes('/history') || req.path.includes('/slip')) action = 'REPORT';
      else if (req.path.includes('/analytics') || req.path.includes('/workforce') || req.path.includes('/cost')) action = 'ANALYTICS';

      const actorUserId = req.user?.id || 'ANONYMOUS';
      const actorPernr = req.user?.pernr || 'N/A';
      const actorPersona = req.user?.persona || 'EMPLOYEE';
      const serviceCode = req.serviceCode || 'GENERIC_API';
      const targetId = req.params.id || req.body?.employeeId || null;
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

      const auditId = 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const metadataObj = {
        query: req.query,
        params: req.params,
        userAgent: req.get('user-agent'),
      };

      await run(
        `INSERT INTO audit_log (
          id, timestamp, actor_user_id, actor_pernr, actor_persona, 
          service_code, action, endpoint, method, target_id, 
          status, http_status, ip_address, duration_ms, metadata
        ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditId,
          actorUserId,
          actorPernr,
          actorPersona,
          serviceCode,
          action,
          req.originalUrl || req.url,
          req.method,
          targetId,
          auditStatus,
          statusCode,
          ipAddress,
          durationMs,
          JSON.stringify(metadataObj)
        ]
      );
    } catch (err) {
      console.error('Failed to persist audit log record:', err);
    }
  });

  next();
}

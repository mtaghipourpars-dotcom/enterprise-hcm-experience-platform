// ============================================================================
// Enterprise HCM Experience Platform - Centralized Error Handler Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/api';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled Server Error:', err);

  const status = err.status || 500;
  const serviceCode = req.serviceCode || 'SYS_ERROR_001';

  const errorResponse: ApiErrorResponse = {
    success: false,
    serviceCode,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server-side execution error occurred.',
      status,
      details: err.details || null,
      timestamp: new Date().toISOString()
    }
  };

  res.status(status).json(errorResponse);
}

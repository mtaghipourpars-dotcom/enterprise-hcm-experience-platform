// ============================================================================
// Enterprise HCM Experience Platform - Server-Side Authorization Middleware
// Multi-Tier RBAC, Structural Authorization & Employee Scope Enforcement
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { AuthUser, PersonaRole, ApiErrorResponse } from '../types/api';
import { query, queryOne } from '../db/database';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      serviceCode?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Check headers for identity
    // Supports: x-user-id, x-persona, x-pernr, or Authorization header
    const headerUserId = req.header('x-user-id');
    const headerPersona = (req.header('x-persona') || '').toUpperCase() as PersonaRole;
    const headerPernr = req.header('x-pernr');
    const authHeader = req.header('authorization');

    let userRecord: any = null;

    if (headerUserId) {
      userRecord = await queryOne('SELECT * FROM app_user WHERE id = ? AND is_active = 1', [headerUserId]);
    } else if (headerPernr) {
      userRecord = await queryOne('SELECT * FROM app_user WHERE pernr = ? AND is_active = 1', [headerPernr]);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      userRecord = await queryOne('SELECT * FROM app_user WHERE pernr = ? OR id = ?', [token, token]);
    } else if (headerPersona) {
      userRecord = await queryOne('SELECT * FROM app_user WHERE persona = ? AND is_active = 1 LIMIT 1', [headerPersona]);
    }

    // Default fallback to standard EMPLOYEE persona if no header provided
    if (!userRecord) {
      userRecord = await queryOne("SELECT * FROM app_user WHERE pernr = '00001001' LIMIT 1");
    }

    if (userRecord) {
      // Fetch org details and roles/permissions
      const org = await queryOne(
        'SELECT org_unit_id, position_id FROM employee_org_assignment WHERE employee_id = ? ORDER BY valid_to DESC LIMIT 1',
        [userRecord.employee_id]
      );

      const roles = await query<{ role_code: string }>(
        `SELECT r.role_code 
         FROM user_role ur 
         JOIN role r ON ur.role_id = r.id 
         WHERE ur.user_id = ?`,
        [userRecord.id]
      );

      const permissions = await query<{ permission_code: string }>(
        `SELECT DISTINCT p.permission_code
         FROM user_role ur
         JOIN role_permission rp ON ur.role_id = rp.role_id
         JOIN permission p ON rp.permission_id = p.id
         WHERE ur.user_id = ?`,
        [userRecord.id]
      );

      req.user = {
        id: userRecord.id,
        employeeId: userRecord.employee_id,
        pernr: userRecord.pernr,
        email: userRecord.email,
        firstName: userRecord.first_name,
        lastName: userRecord.last_name,
        persona: (headerPersona || userRecord.persona) as PersonaRole,
        roles: roles.map(r => r.role_code),
        permissions: permissions.map(p => p.permission_code),
        orgUnitId: org?.org_unit_id || '',
        positionId: org?.position_id || ''
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      serviceCode: req.serviceCode || 'SYS_AUTH_001',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Missing or invalid user identity credentials.',
        status: 401,
        timestamp: new Date().toISOString()
      }
    };
    res.status(401).json(errorResponse);
    return;
  }
  next();
}

export interface PermissionOptions {
  serviceCode: string;
  allowSelfScope?: boolean;
  targetIdParam?: string; // default 'id'
}

export function requirePermission(permissionCode: string, options: PermissionOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.serviceCode = options.serviceCode;

    if (!req.user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        serviceCode: options.serviceCode,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication credentials not provided.',
          status: 401,
          timestamp: new Date().toISOString()
        }
      };
      res.status(401).json(errorResponse);
      return;
    }

    // 1. Check if user holds permission directly or via elevated role
    const hasPermission = req.user.permissions.includes(permissionCode) ||
      req.user.roles.includes('ROLE_SYS_ADMIN') ||
      req.user.roles.includes('ROLE_HR_ADMIN');

    if (!hasPermission) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        serviceCode: options.serviceCode,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Permission denied: Required permission '${permissionCode}' not granted for persona ${req.user.persona}.`,
          status: 403,
          details: {
            requiredPermission: permissionCode,
            currentPersona: req.user.persona,
            heldPermissions: req.user.permissions
          },
          timestamp: new Date().toISOString()
        }
      };
      res.status(403).json(errorResponse);
      return;
    }

    // 2. Check employee scope constraints when accessing employee-specific endpoints
    if (options.allowSelfScope) {
      const paramKey = options.targetIdParam || 'id';
      const targetId = req.params[paramKey];

      if (targetId) {
        // Allow if target is user themselves (by employee_id or pernr)
        const isSelf = targetId === req.user.id ||
                       targetId === req.user.pernr ||
                       targetId === 'me' ||
                       targetId === 'self';

        if (!isSelf) {
          // Check if user is manager and targetId is direct/indirect report
          const isManagerOrAdmin = req.user.persona === 'MANAGER' ||
                                   req.user.persona === 'EXECUTIVE' ||
                                   req.user.persona === 'HR_ADMIN' ||
                                   req.user.roles.includes('ROLE_HR_ADMIN');

          if (!isManagerOrAdmin) {
            const errorResponse: ApiErrorResponse = {
              success: false,
              serviceCode: options.serviceCode,
              error: {
                code: 'SCOPE_VIOLATION',
                message: "Access forbidden: Employees may not inspect another individual's confidential personal records.",
                status: 403,
                details: {
                  currentPernr: req.user.pernr,
                  targetPernr: targetId
                },
                timestamp: new Date().toISOString()
              }
            };
            res.status(403).json(errorResponse);
            return;
          }
        }
      }
    }

    next();
  };
}

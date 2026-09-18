// ============================================================================
// Enterprise HCM Experience Platform - Request Validation Middleware
// Validates parameters, dates, bounds, and payload schemas with field-level details
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse, ApiValidationErrorDetail } from '../types/api';

export type ValidatorFn = (req: Request) => ApiValidationErrorDetail[] | Promise<ApiValidationErrorDetail[]>;

export function validateRequest(serviceCode: string, validator: ValidatorFn) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = await validator(req);
      if (errors && errors.length > 0) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          serviceCode,
          error: {
            code: 'VALIDATION_FAILED',
            message: `Request validation failed with ${errors.length} error(s).`,
            status: 400,
            details: errors,
            timestamp: new Date().toISOString()
          }
        };
        res.status(400).json(errorResponse);
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// ----------------------------------------------------------------------------
// Common Reusable Validation Helpers
// ----------------------------------------------------------------------------

export function isValidIsoDate(dateStr?: string): boolean {
  if (!dateStr) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export function validateRequiredFields(obj: Record<string, any>, fields: string[]): ApiValidationErrorDetail[] {
  const errors: ApiValidationErrorDetail[] = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push({
        field,
        message: `Field '${field}' is required and cannot be empty.`,
        code: 'REQUIRED_FIELD_MISSING'
      });
    }
  }
  return errors;
}

export function validateDateRange(startDate?: string, endDate?: string, startField = 'startDate', endField = 'endDate'): ApiValidationErrorDetail[] {
  const errors: ApiValidationErrorDetail[] = [];
  if (startDate && !isValidIsoDate(startDate)) {
    errors.push({ field: startField, message: `'${startField}' must be a valid ISO date (YYYY-MM-DD).`, code: 'INVALID_DATE_FORMAT' });
  }
  if (endDate && !isValidIsoDate(endDate)) {
    errors.push({ field: endField, message: `'${endField}' must be a valid ISO date (YYYY-MM-DD).`, code: 'INVALID_DATE_FORMAT' });
  }
  if (startDate && endDate && isValidIsoDate(startDate) && isValidIsoDate(endDate)) {
    if (startDate > endDate) {
      errors.push({
        field: endField,
        message: `'${endField}' cannot be earlier than '${startField}'.`,
        code: 'INVALID_DATE_RANGE'
      });
    }
  }
  return errors;
}

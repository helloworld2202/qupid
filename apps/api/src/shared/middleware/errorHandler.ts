import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import pino from 'pino';

const logger = pino();

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log error
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status,
    }
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors
      }
    });
  }

  // Handle AppError
  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Handle unexpected errors
  const error = err instanceof Error ? err : new Error('Unexpected error');
  const appError = AppError.internal(error.message, error);
  
  return res.status(appError.status).json({
    ok: false,
    error: {
      code: appError.code,
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : appError.message
    }
  });
};
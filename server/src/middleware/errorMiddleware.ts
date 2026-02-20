import type { Request, Response, NextFunction } from 'express';
import { ErrorHandler, AppError } from '../utils/errorHandler.js';

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let errorResponse;

  // Handle custom AppError instances (includes BadRequestError, NotFoundError, ConflictError, etc.)
  if (error instanceof AppError) {
    errorResponse = ErrorHandler.createError(error.message, error.statusCode);
  }
  // Handle Zod validation errors
  else if (error.name === 'ZodError') {
    errorResponse = ErrorHandler.handleValidationError(error);
  }
  // Handle Mongoose validation errors
  else if (error.name === 'ValidationError') {
    errorResponse = ErrorHandler.createError('Validation failed', 400, {
      errors: Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  else if (error.name === 'CastError') {
    errorResponse = ErrorHandler.createError('Invalid data format', 400);
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    errorResponse = ErrorHandler.createError('Invalid token', 401);
  }
  else if (error.name === 'TokenExpiredError') {
    errorResponse = ErrorHandler.createError('Token expired', 401);
  }
  // Handle authentication errors
  else if (error.name === 'AuthenticationError' || error.message?.includes('authentication')) {
    errorResponse = ErrorHandler.createError('Authentication failed', 401);
  }
  // Handle authorization errors
  else if (error.name === 'AuthorizationError' || error.message?.includes('authorization')) {
    errorResponse = ErrorHandler.createError('Access denied', 403);
  }
  // Handle syntax errors
  else if (error instanceof SyntaxError) {
    errorResponse = ErrorHandler.createError('Invalid request syntax', 400);
  }
  // Handle reference errors
  else if (error instanceof ReferenceError) {
    errorResponse = ErrorHandler.createError('Internal server error', 500);
  }
  // Handle type errors
  else if (error instanceof TypeError) {
    errorResponse = ErrorHandler.createError('Invalid operation', 400);
  }
  // Handle database errors
  else if (error.code && typeof error.code === 'number') {
    errorResponse = ErrorHandler.handleDatabaseError(error);
  }
  // Handle generic errors
  else {
    errorResponse = ErrorHandler.handleGenericError(error);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
};
/**
 * Error handling utilities for the application
 *
 * Usage Examples:
 *
 * // Throw specific HTTP errors
 * throw new BadRequestError('Invalid input data');
 * throw new NotFoundError('User not found');
 * throw new ConflictError('Email already exists');
 * throw new UnauthorizedError('Invalid credentials');
 * throw new ForbiddenError('Access denied');
 * throw new InternalServerError('Something went wrong');
 *
 * // Or use the generic AppError with custom status code
 * throw new AppError('Custom error message', 422);
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for common HTTP status codes
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * Error handler utility for creating standardized error responses
 */
export class ErrorHandler {
  /**
   * Create a standardized error response
   */
  static createError(message: string, statusCode: number = 500, details?: any) {
    return {
      success: false,
      message,
      statusCode,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle validation errors from Zod or other validators
   */
  static handleValidationError(error: any) {
    const errors = error.errors || error.issues || [];
    const errorMessages = errors.map((err: any) => ({
      field: err.path?.join('.') || 'unknown',
      message: err.message
    }));

    return this.createError('Validation failed', 400, { errors: errorMessages });
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return this.createError(`${field} already exists`, 409);
    }

    return this.createError('Database operation failed', 500);
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(error: any) {
    // In development, include stack trace
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      ...this.createError(error.message || 'Internal server error', error.statusCode || 500),
      ...(isDevelopment && { stack: error.stack })
    };
  }
}
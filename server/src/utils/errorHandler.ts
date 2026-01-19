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

export class ErrorHandler {
  static createError(message: string, statusCode: number = 500, details?: any) {
    return {
      success: false,
      message,
      statusCode,
      ...(details && { details }),
      timestamp: new Date().toISOString()
    };
  }

  static handleValidationError(error: any) {
    const errors = error.errors || error.issues || [];
    const errorMessages = errors.map((err: any) => ({
      field: err.path?.join('.') || 'unknown',
      message: err.message
    }));

    return this.createError('Validation failed', 400, { errors: errorMessages });
  }

  static handleDatabaseError(error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return this.createError(`${field} already exists`, 409);
    }

    return this.createError('Database operation failed', 500);
  }

  static handleGenericError(error: any) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return {
      ...this.createError(error.message || 'Internal server error', error.statusCode || 500),
      ...(isDevelopment && { stack: error.stack })
    };
  }
}
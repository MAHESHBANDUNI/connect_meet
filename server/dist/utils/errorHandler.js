"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.InternalServerError = exports.ForbiddenError = exports.UnauthorizedError = exports.ConflictError = exports.NotFoundError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
class ErrorHandler {
    static createError(message, statusCode = 500, details) {
        return {
            success: false,
            message,
            statusCode,
            ...(details && { details }),
            timestamp: new Date().toISOString()
        };
    }
    static handleValidationError(error) {
        const errors = error.errors || error.issues || [];
        const errorMessages = errors.map((err) => ({
            field: err.path?.join('.') || 'unknown',
            message: err.message
        }));
        return this.createError('Validation failed', 400, { errors: errorMessages });
    }
    static handleDatabaseError(error) {
        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyValue)[0];
            return this.createError(`${field} already exists`, 409);
        }
        return this.createError('Database operation failed', 500);
    }
    static handleGenericError(error) {
        const isDevelopment = process.env.NODE_ENV === 'development';
        return {
            ...this.createError(error.message || 'Internal server error', error.statusCode || 500),
            ...(isDevelopment && { stack: error.stack })
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map
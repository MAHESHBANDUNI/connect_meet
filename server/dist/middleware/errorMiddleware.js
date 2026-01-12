"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorHandler_js_1 = require("../utils/errorHandler.js");
/**
 * Global error handling middleware
 * This middleware should be placed after all other middleware and routes
 */
const errorMiddleware = (error, req, res, next) => {
    let errorResponse;
    // Handle custom AppError instances (includes BadRequestError, NotFoundError, ConflictError, etc.)
    if (error instanceof errorHandler_js_1.AppError) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError(error.message, error.statusCode);
    }
    // Handle Zod validation errors
    else if (error.name === 'ZodError') {
        errorResponse = errorHandler_js_1.ErrorHandler.handleValidationError(error);
    }
    // Handle Mongoose validation errors
    else if (error.name === 'ValidationError') {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Validation failed', 400, {
            errors: Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message
            }))
        });
    }
    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    else if (error.name === 'CastError') {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Invalid data format', 400);
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Invalid token', 401);
    }
    else if (error.name === 'TokenExpiredError') {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Token expired', 401);
    }
    // Handle authentication errors
    else if (error.name === 'AuthenticationError' || error.message?.includes('authentication')) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Authentication failed', 401);
    }
    // Handle authorization errors
    else if (error.name === 'AuthorizationError' || error.message?.includes('authorization')) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Access denied', 403);
    }
    // Handle syntax errors
    else if (error instanceof SyntaxError) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Invalid request syntax', 400);
    }
    // Handle reference errors
    else if (error instanceof ReferenceError) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Internal server error', 500);
    }
    // Handle type errors
    else if (error instanceof TypeError) {
        errorResponse = errorHandler_js_1.ErrorHandler.createError('Invalid operation', 400);
    }
    // Handle database errors
    else if (error.code && typeof error.code === 'number') {
        errorResponse = errorHandler_js_1.ErrorHandler.handleDatabaseError(error);
    }
    // Handle generic errors
    else {
        errorResponse = errorHandler_js_1.ErrorHandler.handleGenericError(error);
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }
    // Send error response
    res.status(errorResponse.statusCode).json(errorResponse);
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=errorMiddleware.js.map
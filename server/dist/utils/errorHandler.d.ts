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
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/**
 * Specific error classes for common HTTP status codes
 */
export declare class BadRequestError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
/**
 * Error handler utility for creating standardized error responses
 */
export declare class ErrorHandler {
    /**
     * Create a standardized error response
     */
    static createError(message: string, statusCode?: number, details?: any): any;
    /**
     * Handle validation errors from Zod or other validators
     */
    static handleValidationError(error: any): any;
    /**
     * Handle database errors
     */
    static handleDatabaseError(error: any): any;
    /**
     * Handle generic errors
     */
    static handleGenericError(error: any): any;
}
//# sourceMappingURL=errorHandler.d.ts.map
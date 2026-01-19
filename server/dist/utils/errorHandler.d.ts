export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
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
export declare class ErrorHandler {
    static createError(message: string, statusCode?: number, details?: any): any;
    static handleValidationError(error: any): any;
    static handleDatabaseError(error: any): any;
    static handleGenericError(error: any): any;
}
//# sourceMappingURL=errorHandler.d.ts.map
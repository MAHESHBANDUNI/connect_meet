import type { Request, Response, NextFunction } from 'express';
/**
 * Global error handling middleware
 * This middleware should be placed after all other middleware and routes
 */
export declare const errorMiddleware: (error: any, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorMiddleware.d.ts.map
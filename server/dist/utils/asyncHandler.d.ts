import type { Request, Response, NextFunction } from 'express';
/**
 * Higher-order function that wraps async route handlers to catch errors
 * and pass them to the next error handling middleware
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=asyncHandler.d.ts.map
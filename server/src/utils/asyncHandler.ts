import type { Request, Response, NextFunction } from 'express';

/**
 * Higher-order function that wraps async route handlers to catch errors
 * and pass them to the next error handling middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
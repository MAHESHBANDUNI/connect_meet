import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import 'dotenv/config';
import userRoutes from './modules/user/user.route.js';
import authRoutes from './modules/auth/auth.route.js';
import meetingRoutes from './modules/meeting/meeting.route.js';
import cors from 'cors';
import crypto from 'crypto';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { configurePassport } from './modules/auth/passport.config.js';

export function createServer(): Express {
  const server: Express = express();

  configurePassport();

  server.use(express.json());
  server.use(cookieParser());

  const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Cache-Control',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
  };

  server.use(cors(corsOptions));

  server.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString("base64");
    next();
  });

  server.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", (req: IncomingMessage, res: ServerResponse) => `'nonce-${(res as any).locals.cspNonce}'`],
          styleSrc: ["'self'", (req: IncomingMessage, res: ServerResponse) => `'nonce-${(res as any).locals.cspNonce}'`],
          imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  server.use('/api/users', userRoutes);
  server.use('/api/auth', authRoutes);
  server.use('/api/meetings', meetingRoutes);

  server.use(errorMiddleware);

  return server;
}

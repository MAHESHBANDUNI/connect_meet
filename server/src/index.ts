import express from 'express';
import type { Express } from 'express';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import 'dotenv/config';
import userRoutes from './user/user.route.js';
import authRoutes from './auth/auth.route.js';
import cors from 'cors';
import crypto from 'crypto';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { configurePassport } from './auth/passport.config.js';

const server: Express = express();

configurePassport();

server.use(express.json());
server.use(cookieParser());

// CORS config
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control', 'ngrok-skip-browser-warning'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Apply CORS globally
server.use(cors(corsOptions));

// Middleware to generate a CSP nonce
server.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(32).toString("base64");
  next();
});

// Configure Helmet for enhanced security (modified for OAuth)
server.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req: any, res: any) => `'nonce-${res?.locals.cspNonce}'`],
        styleSrc: ["'self'", (req: any, res: any) => `'nonce-${res?.locals.cspNonce}'`],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"], // Allow Google profile images
        objectSrc: ["'none'"],
        fontSrc: ["'self'"],
        frameSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Often needed for OAuth redirects
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

server.use('/api/users', userRoutes);
server.use('/api/auth', authRoutes);

// Global error handling middleware (must be last)
server.use(errorMiddleware);

async function startServer() {
  try {
    // Start the Express server
    const port = process.env.PORT;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    // Exit the process if we can't start properly
    // This ensures the application doesn't run in a broken state
    process.exit(1);
  }
}

/**
 * Graceful Shutdown Handler
 * Ensures the application shuts down cleanly when terminated
 */
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Shutting down...");
  process.exit(0);
});

startServer();
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorMiddleware_js_1 = require("./middleware/errorMiddleware.js");
require("dotenv/config");
const user_route_js_1 = __importDefault(require("./user/user.route.js"));
const auth_route_js_1 = __importDefault(require("./auth/auth.route.js"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_config_js_1 = require("./auth/passport.config.js");
const server = (0, express_1.default)();
(0, passport_config_js_1.configurePassport)();
server.use(express_1.default.json());
server.use((0, cookie_parser_1.default)());
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
server.use((0, cors_1.default)(corsOptions));
// Middleware to generate a CSP nonce
server.use((req, res, next) => {
    res.locals.cspNonce = crypto_1.default.randomBytes(32).toString("base64");
    next();
});
// Configure Helmet for enhanced security (modified for OAuth)
server.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", (req, res) => `'nonce-${res?.locals.cspNonce}'`],
            styleSrc: ["'self'", (req, res) => `'nonce-${res?.locals.cspNonce}'`],
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
}));
server.use('/api/users', user_route_js_1.default);
server.use('/api/auth', auth_route_js_1.default);
// Global error handling middleware (must be last)
server.use(errorMiddleware_js_1.errorMiddleware);
async function startServer() {
    try {
        // Start the Express server
        const port = process.env.PORT;
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map
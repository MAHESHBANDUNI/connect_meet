"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const errorMiddleware_js_1 = require("./middleware/errorMiddleware.js");
require("dotenv/config");
const user_route_js_1 = __importDefault(require("./modules/user/user.route.js"));
const auth_route_js_1 = __importDefault(require("./modules/auth/auth.route.js"));
const meeting_route_js_1 = __importDefault(require("./modules/meeting/meeting.route.js"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_config_js_1 = require("./modules/auth/passport.config.js");
function createServer() {
    const server = (0, express_1.default)();
    (0, passport_config_js_1.configurePassport)();
    server.use(express_1.default.json());
    server.use((0, cookie_parser_1.default)());
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
    server.use((0, cors_1.default)(corsOptions));
    server.use((req, res, next) => {
        res.locals.cspNonce = crypto_1.default.randomBytes(32).toString("base64");
        next();
    });
    server.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
                styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
                imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
                objectSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    server.use('/api/users', user_route_js_1.default);
    server.use('/api/auth', auth_route_js_1.default);
    server.use('/api/meetings', meeting_route_js_1.default);
    server.use(errorMiddleware_js_1.errorMiddleware);
    return server;
}
//# sourceMappingURL=server.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_js_1 = require("./auth.service.js");
const authService = new auth_service_js_1.AuthService();
const configurePassport = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI || '/api/auth/google/callback',
        passReqToCallback: true,
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const { user, token } = await authService.handleOAuthUser(profile);
            return done(null, { ...user, token });
        }
        catch (error) {
            return done(error, undefined);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.userId);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await authService['repo'].findById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
};
exports.configurePassport = configurePassport;
//# sourceMappingURL=passport.config.js.map
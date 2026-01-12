import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service.js';

const authService = new AuthService();

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_REDIRECT_URI || '/api/auth/google/callback',
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const { user, token } = await authService.handleOAuthUser(profile);
                    // We attach the token to the user object for convenience
                    return done(null, { ...user, token });
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.userId);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await authService['repo'].findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

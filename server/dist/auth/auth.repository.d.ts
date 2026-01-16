import { users } from "../drizzle/schema.js";
import { UserSigninInput } from "./auth.validation.js";
export declare class AuthRepository {
    signin(data: UserSigninInput): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    findByEmail(email: string): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    findByGoogleId(googleId: string): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    findById(userId: string): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    createOAuthUser(data: {
        firstName: string;
        lastName: string;
        email: string;
        googleId: string;
        authProvider: string;
        isEmailVerified: boolean;
        roleId: number;
        password?: string;
    }): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
    updateOAuthUser(userId: string, data: Partial<typeof users.$inferInsert>): Promise<{
        roleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string | null;
        googleId: string | null;
        authProvider: string;
        isEmailVerified: boolean;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | undefined>;
}
//# sourceMappingURL=auth.repository.d.ts.map
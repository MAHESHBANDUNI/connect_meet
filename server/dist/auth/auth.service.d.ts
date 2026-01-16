import { AuthRepository } from "./auth.repository.js";
import { UserSigninInput, UserSignupInput } from "./auth.validation.js";
export declare class AuthService {
    private readonly repo;
    constructor(repo?: AuthRepository);
    userSignin(data: UserSigninInput): Promise<{
        user: {
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
        };
        token: string;
    }>;
    userSignup(data: UserSignupInput): Promise<{
        user: {
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
        } | undefined;
        token: string;
    }>;
    handleOAuthUser(profile: any): Promise<{
        user: {
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
        } | undefined;
        token: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map
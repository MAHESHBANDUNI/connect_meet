import { CreateUserInput } from "./user.validation";
export declare class UserRepository {
    create(data: CreateUserInput): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
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
    } | undefined>;
    delete(userId: string): Promise<void>;
}
//# sourceMappingURL=user.repository.d.ts.map
import { UserRepository } from "./user.repository";
import { CreateUserInput } from "./user.validation";
export declare class UserService {
    private readonly repo;
    constructor(repo?: UserRepository);
    createUser(data: CreateUserInput): Promise<{
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
        isEmailVerified: string;
    }>;
    getUsers(): Promise<{
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
        isEmailVerified: string;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }[]>;
    getUserById(id: string): Promise<{
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
        isEmailVerified: string;
        role: {
            roleId: number;
            roleName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    deleteUser(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map
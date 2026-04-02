import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { AuthUser } from './auth-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            status: "ACTIVE";
        };
    }>;
    profile(user: AuthUser): Promise<{
        username: string;
        id: number;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

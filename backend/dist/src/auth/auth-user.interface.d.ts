import { Role } from '@prisma/client';
export interface AuthUser {
    userId: number;
    username: string;
    name: string;
    role: Role;
}

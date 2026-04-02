import { Role, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    username: string;
    name: string;
    password: string;
    role: Role;
    status?: UserStatus;
}

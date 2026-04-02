import { Gender, StudentStatus } from '@prisma/client';
export declare class CreateStudentDto {
    studentNo: string;
    name: string;
    gender: Gender;
    classId: number;
    phone?: string;
    email?: string;
    enrollYear: number;
    status?: StudentStatus;
    remark?: string;
}

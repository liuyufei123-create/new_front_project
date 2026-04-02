import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
export declare class StudentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryStudentsDto): Promise<{
        items: ({
            class: {
                id: number;
                name: string;
                gradeYear: number;
            };
        } & {
            id: number;
            name: string;
            status: import("@prisma/client").$Enums.StudentStatus;
            createdAt: Date;
            updatedAt: Date;
            studentNo: string;
            gender: import("@prisma/client").$Enums.Gender;
            phone: string | null;
            email: string | null;
            enrollYear: number;
            remark: string | null;
            classId: number;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<{
        class: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            gradeYear: number;
            headTeacherId: number | null;
            description: string | null;
        };
        grades: ({
            course: {
                id: number;
                name: string;
                code: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            semester: string;
            usualScore: number;
            examScore: number;
            totalScore: number;
            studentId: number;
            courseId: number;
        })[];
    } & {
        id: number;
        name: string;
        status: import("@prisma/client").$Enums.StudentStatus;
        createdAt: Date;
        updatedAt: Date;
        studentNo: string;
        gender: import("@prisma/client").$Enums.Gender;
        phone: string | null;
        email: string | null;
        enrollYear: number;
        remark: string | null;
        classId: number;
    }>;
    create(dto: CreateStudentDto): Promise<{
        class: {
            id: number;
            name: string;
            gradeYear: number;
        };
    } & {
        id: number;
        name: string;
        status: import("@prisma/client").$Enums.StudentStatus;
        createdAt: Date;
        updatedAt: Date;
        studentNo: string;
        gender: import("@prisma/client").$Enums.Gender;
        phone: string | null;
        email: string | null;
        enrollYear: number;
        remark: string | null;
        classId: number;
    }>;
    update(id: number, dto: UpdateStudentDto): Promise<{
        class: {
            id: number;
            name: string;
            gradeYear: number;
        };
    } & {
        id: number;
        name: string;
        status: import("@prisma/client").$Enums.StudentStatus;
        createdAt: Date;
        updatedAt: Date;
        studentNo: string;
        gender: import("@prisma/client").$Enums.Gender;
        phone: string | null;
        email: string | null;
        enrollYear: number;
        remark: string | null;
        classId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        status: import("@prisma/client").$Enums.StudentStatus;
        createdAt: Date;
        updatedAt: Date;
        studentNo: string;
        gender: import("@prisma/client").$Enums.Gender;
        phone: string | null;
        email: string | null;
        enrollYear: number;
        remark: string | null;
        classId: number;
    }>;
    private ensureExists;
}

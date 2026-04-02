import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryClassesDto): Promise<{
        items: ({
            _count: {
                students: number;
            };
            headTeacher: {
                username: string;
                id: number;
                name: string;
            } | null;
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            gradeYear: number;
            headTeacherId: number | null;
            description: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<{
        headTeacher: {
            username: string;
            id: number;
            name: string;
        } | null;
        students: {
            id: number;
            name: string;
            status: import("@prisma/client").$Enums.StudentStatus;
            studentNo: string;
            gender: import("@prisma/client").$Enums.Gender;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gradeYear: number;
        headTeacherId: number | null;
        description: string | null;
    }>;
    create(dto: CreateClassDto): Promise<{
        headTeacher: {
            username: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gradeYear: number;
        headTeacherId: number | null;
        description: string | null;
    }>;
    update(id: number, dto: UpdateClassDto): Promise<{
        headTeacher: {
            username: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gradeYear: number;
        headTeacherId: number | null;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        gradeYear: number;
        headTeacherId: number | null;
        description: string | null;
    }>;
    private ensureExists;
}

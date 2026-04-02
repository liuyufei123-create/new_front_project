import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryCoursesDto): Promise<{
        items: ({
            _count: {
                grades: number;
            };
            teacher: {
                username: string;
                id: number;
                name: string;
            } | null;
        } & {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            code: string;
            credit: number;
            teacherId: number | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<{
        grades: ({
            student: {
                id: number;
                name: string;
                studentNo: string;
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
        teacher: {
            username: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        credit: number;
        teacherId: number | null;
    }>;
    create(dto: CreateCourseDto): Promise<{
        teacher: {
            username: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        credit: number;
        teacherId: number | null;
    }>;
    update(id: number, dto: UpdateCourseDto): Promise<{
        teacher: {
            username: string;
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        credit: number;
        teacherId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        credit: number;
        teacherId: number | null;
    }>;
    private ensureExists;
}

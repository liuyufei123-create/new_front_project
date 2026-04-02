import { CreateGradeDto } from './dto/create-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradesService } from './grades.service';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class GradesController {
    private readonly gradesService;
    constructor(gradesService: GradesService);
    findAll(query: QueryGradesDto, user: AuthUser): Promise<{
        items: ({
            student: {
                id: number;
                name: string;
                studentNo: string;
            };
            course: {
                id: number;
                name: string;
                code: string;
                teacherId: number | null;
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
        total: number;
        page: number;
        pageSize: number;
    }>;
    create(dto: CreateGradeDto, user: AuthUser): Promise<{
        student: {
            id: number;
            name: string;
            studentNo: string;
        };
        course: {
            id: number;
            name: string;
            code: string;
            teacherId: number | null;
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
    }>;
    update(id: number, dto: UpdateGradeDto, user: AuthUser): Promise<{
        student: {
            id: number;
            name: string;
            studentNo: string;
        };
        course: {
            id: number;
            name: string;
            code: string;
            teacherId: number | null;
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
    }>;
    remove(id: number, user: AuthUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        semester: string;
        usualScore: number;
        examScore: number;
        totalScore: number;
        studentId: number;
        courseId: number;
    }>;
}

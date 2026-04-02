import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        studentCount: number;
        classCount: number;
        courseCount: number;
        gradeCount: number;
    }>;
    getClassDistribution(): Promise<{
        classId: number;
        className: string;
        studentCount: number;
    }[]>;
    getCourseAverage(): Promise<{
        courseId: number;
        courseName: string;
        courseCode: string;
        averageScore: number;
    }[]>;
    getPassRate(): Promise<{
        courseId: number;
        courseName: string;
        courseCode: string;
        passRate: number;
    }[]>;
}
